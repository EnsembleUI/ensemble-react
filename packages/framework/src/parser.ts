import { parse } from "yaml";
import {
  get,
  head,
  isArray,
  isEmpty,
  isObject,
  map,
  mapKeys,
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
  CustomWidgetModel,
  EnsembleThemeModel,
} from "./shared/models";
import type { ApplicationDTO } from "./shared/dto";
import { findExpressions, type EnsembleAction } from "./shared";
import { evaluate } from "./evaluate";
import { defaultScreenContext } from "./state";

export interface EnsembleScreenYAML {
  View?: {
    header?: Record<string, unknown>;
    body: Record<string, unknown>;
    footer?: Record<string, unknown>;
  };
  ViewGroup?: Record<string, unknown>;
}

export interface EnsembleWidgetYAML {
  Widget: {
    inputs?: string[];
    onLoad?: EnsembleAction;
    body: Record<string, unknown>;
  };
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

    const customWidgets = (app.widgets ?? []).map(({ name, content: yaml }) =>
      EnsembleParser.parseWidget(name, parse(yaml) as EnsembleWidgetYAML),
    );

    const menu = screens.find((screen) => "items" in screen) as
      | EnsembleMenuModel
      | undefined;

    if (menu) {
      remove(screens, (screen) => screen === menu);
      menu.items.forEach(
        (item) =>
          (item.screen = screens.find(
            (screen) => "name" in screen && screen.name === item.page,
          ) as EnsembleScreenModel),
      );
    }

    const theme = unwrapTheme(app.theme?.content);
    const scripts = app.scripts.map(({ name, content }) => ({
      name,
      body: content,
    }));

    return {
      id: app.id,
      menu,
      screens: screens as EnsembleScreenModel[],
      customWidgets,
      home: menu ?? screens[0],
      theme,
      scripts,
    };
  },

  parseScreen: (
    name: string,
    screen: EnsembleScreenYAML,
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

    const global = get(screen, "Global");
    return {
      ...(view ?? {}),
      name,
      global,
      header: unwrapHeader(header),
      footer: unwrapFooter(footer),
      body: viewWidget,
      apis,
    };
  },

  parseWidget: (name: string, yaml: EnsembleWidgetYAML): CustomWidgetModel => {
    const widget = get(yaml, "Widget");

    const rawBody = get(widget, "body");
    if (!rawBody) {
      throw Error("Widget must have a body");
    }

    const body = unwrapWidget(rawBody);
    return {
      name,
      onLoad: get(widget, "onLoad"),
      inputs: get(widget, "inputs") ?? [],
      body,
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
  if (isArray(children)) {
    const unwrappedChildren = map(children, unwrapWidget);
    set(properties as object, "children", unwrappedChildren);
  }
  if (isObject(template)) {
    const unwrappedTemplate = unwrapWidget(template as Record<string, unknown>);
    set(properties as object, ["item-template", "template"], unwrappedTemplate);
  }
  if (!isEmpty(items) && isArray(items)) {
    if (isObject(items[0]) && "widget" in items[0]) {
      const valueItems = (items as Record<string, unknown>[]).map(
        ({ label, widget, icon }) => {
          const unwrappedWidget = unwrapWidget(
            widget as Record<string, unknown>,
          );
          return { label, icon, widget: unwrappedWidget };
        },
      );
      set(properties as object, "items", valueItems);
    } else {
      set(properties as object, "items", items);
    }
  }

  return {
    name,
    properties: (properties ?? {}) as Record<string, unknown>,
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

const unwrapTheme = (theme?: string): EnsembleThemeModel | undefined => {
  if (!theme || isEmpty(theme)) {
    return;
  }

  const workingTheme = parse(theme) as EnsembleThemeModel;
  if (!workingTheme.Styles) {
    return workingTheme;
  }

  const expressionMap: string[][] = [];
  findExpressions(workingTheme.Styles, [], expressionMap);

  const resolvedProps: [string, unknown][] = expressionMap.map(
    ([path, expression]) => {
      const result = evaluate(
        defaultScreenContext,
        expression,
        mapKeys(workingTheme.Tokens ?? {}, (_, key) => key.toLowerCase()),
      );
      return [path, result];
    },
  );

  resolvedProps.forEach(([path, value]) =>
    set(workingTheme.Styles!, path, value),
  );

  return workingTheme;
};
