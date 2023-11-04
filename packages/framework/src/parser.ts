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
  EnsembleHeaderModel,
  EnsembleFooterModel,
} from "./shared/models";
import type { ApplicationDTO } from "./shared/dto";

export interface EnsembleScreenYAML {
  View?: {
    header?: Record<string, unknown>;
    body: Record<string, unknown>;
    footer?: Record<string, unknown>;
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
      id: app.id,
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
    const header = get(view, "header");
    const footer = get(view, "footer");

    if (!viewNode) {
      throw new Error("Invalid screen: missing view widget");
    }
    const viewWidget = unwrapWidget(viewNode);
    const apis = unwrapApiModels(screen);

    return {
      ...(view ?? {}),
      name,
      header: unwrapHeader(header),
      footer: unwrapFooter(footer),
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
  const items = get(properties, "items");
  const steps = get(properties, "steps");
  if (isArray(children)) {
    const unwrappedChildren = map(children, unwrapWidget);
    set(properties as object, "children", unwrappedChildren);
  }
  if (isObject(template)) {
    const unwrappedTemplate = unwrapWidget(template as Record<string, unknown>);
    set(properties as object, ["item-template", "template"], unwrappedTemplate);
  }
  if (isArray(items) && !isEmpty(items)) {
    if ("widget" in items[0]) {
      const valueItems = (items as Record<string, unknown>[]).map(
        ({ label, widget, icon }) => {
          const unwrappedWidget = unwrapWidget(
            widget as Record<string, unknown>
          );
          return { label, icon, widget: unwrappedWidget };
        }
      );
      set(properties as object, "items", valueItems);
    }
  }
  if (isArray(steps) && !isEmpty(steps)) {
    if ("contentWidget" in steps[0]) {
      const valueSteps = (steps as Record<string, unknown>[]).map(
        ({ stepLabel, contentWidget }) => {
          const unwrappedWidget = unwrapWidget(
            contentWidget as Record<string, unknown>
          );
          return {
            stepLabel,
            contentWidget: unwrappedWidget,
          };
        }
      );
      set(properties as object, "steps", valueSteps);
    }
  }
  return {
    name,
    properties: properties as Record<string, unknown>,
  };
};

export const unwrapHeader = (
  header: Record<string, unknown> | undefined,
): EnsembleHeaderModel | undefined => {
  const title = get(header, "title") as
    | Record<string, unknown>
    | string
    | undefined;

  if (!header || !title) return;

  return {
    title: typeof title === "string" ? title : unwrapWidget(title),
    styles: get(header, "styles") as Record<string, unknown>,
  };
};

const unwrapFooter = (
  footer: Record<string, unknown> | undefined,
): EnsembleFooterModel | undefined => {
  if (!footer) return;

  const children = get(footer, "children");
  if (isArray(children)) {
    const unwrappedChildren = map(children, (child) =>
      unwrapWidget(child as Record<string, unknown>),
    );
    set(footer as object, "children", unwrappedChildren);

    return {
      children: unwrappedChildren,
      styles: get(footer, "styles") as Record<string, unknown>,
    };
  }
};
