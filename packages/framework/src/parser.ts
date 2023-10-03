import { parse } from "yaml";
import {
  get,
  head,
  isArray,
  isEmpty,
  isObject,
  map,
  remove,
  set,
} from "lodash-es";
import type {
  EnsembleScreenModel,
  EnsembleAPIModel,
  EnsembleWidget,
  EnsembleAppModel,
  EnsembleMenuModel,
} from "./shared/models";
import type { ApplicationDTO } from "./shared/dto";

export interface EnsembleScreenYAML {
  View?: {
    body: Record<string, unknown>;
  };
  ViewGroup?: Record<string, unknown>;
}

export const EnsembleParser = {
  parseApplication: (app: ApplicationDTO): EnsembleAppModel => {
    const screens = app.screens.map(({ name, content: yaml }) => {
      const screen = parse(yaml) as EnsembleScreenYAML;
      const viewGroup = get(screen, "ViewGroup");
      if (viewGroup) {
        return EnsembleParser.parseMenu(viewGroup);
      }
      return EnsembleParser.parseScreen(name, screen);
    });
    if (isEmpty(screens)) {
      throw Error("Application must have at least one screen");
    }

    const menu = screens.find((screen) => "items" in screen) as
      | EnsembleMenuModel
      | undefined;

    if (menu) {
      remove(screens, (screen) => screen === menu);
      menu.items.forEach(
        (item) =>
          (item.screen = screens.find(
            (screen) => "name" in screen && screen.name === item.page
          ) as EnsembleScreenModel)
      );
    }

    return {
      menu,
      screens: screens as EnsembleScreenModel[],
      home: menu ?? screens[0],
      theme: app.theme,
    };
  },

  parseScreen: (
    name: string,
    screen: EnsembleScreenYAML
  ): EnsembleScreenModel | EnsembleMenuModel => {
    const view = get(screen, "View");
    const viewNode = get(view, "body");
    if (!viewNode) {
      throw new Error("Invalid screen: missing view widget");
    }
    const viewWidget = unwrapWidget(viewNode);
    const apis = unwrapApiModels(screen);
    return {
      ...(view ?? {}),
      name,
      header: get(view, "header"),
      body: viewWidget,
      apis,
    };
  },

  parseMenu: (menu: object): EnsembleMenuModel => {
    const menuType = head(Object.keys(menu));
    if (!menuType) {
      throw Error("Invalid ViewGroup definition: invalid menu type");
    }

    const headerDef = get(menu, [menuType, "header"]) as
      | Record<string, unknown>
      | undefined;
    const footerDef = get(menu, [menuType, "footer"]) as
      | Record<string, unknown>
      | undefined;
    return {
      type: String(menuType),
      items: get(menu, [menuType, "items"]) as [],
      header: headerDef ? unwrapWidget(headerDef) : undefined,
      footer: footerDef ? unwrapWidget(footerDef) : undefined,
      styles: get(menu, [menuType, "styles"]) as Record<string, unknown>,
    };
  },
};

const unwrapApiModels = (screen: unknown): EnsembleAPIModel[] => {
  const apiNode = get(screen, "API");
  if (isArray(apiNode)) {
    return map<object, EnsembleAPIModel>(apiNode, (value) => {
      const name = head(Object.keys(value));
      return {
        name,
        ...value,
      } as EnsembleAPIModel;
    });
  }
  if (isObject(apiNode)) {
    return map(Object.entries<object>(apiNode), ([name, value]) => {
      return {
        name,
        ...value,
      } as EnsembleAPIModel;
    });
  }
  return [];
};

export const unwrapWidget = (obj: Record<string, unknown>): EnsembleWidget => {
  const name = head(Object.keys(obj));
  if (!name) {
    throw Error("Invalid widget definition");
  }
  const properties = get(obj, name);
  const children = get(properties, "children");
  const template = get(properties, ["item-template", "template"]) as unknown;
  if (isArray(children)) {
    const unwrappedChildren = map(children, unwrapWidget);
    set(properties as object, "children", unwrappedChildren);
  }
  if (isObject(template)) {
    const unwrappedTemplate = unwrapWidget(template as Record<string, unknown>);
    set(properties as object, ["item-template", "template"], unwrappedTemplate);
  }
  return {
    name,
    properties: properties as Record<string, unknown>,
  };
};
