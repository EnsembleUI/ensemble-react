import { parse } from "yaml";
import {
  flatMap,
  get,
  head,
  isArray,
  isEmpty,
  isObject,
  map,
  mapKeys,
  remove,
  set,
  isString,
  concat,
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
import type { ApplicationDTO, EnsembleConfigYAML } from "./shared/dto";
import { findExpressions, type EnsembleAction } from "./shared";
import { evaluate } from "./evaluate/evaluate";
import { defaultScreenContext } from "./state";

export interface EnsembleScreenYAML {
  View?: {
    header?: { [key: string]: unknown };
    body: { [key: string]: unknown };
    footer?: { [key: string]: unknown };
    style?: { [key: string]: unknown };
    [k: string]: { [key: string]: unknown } | undefined;
  };
  ViewGroup?: { [key: string]: unknown };
}

export interface EnsembleWidgetYAML {
  Widget: {
    inputs?: string[];
    onLoad?: EnsembleAction;
    body: { [key: string]: unknown };
  };
}

export const EnsembleParser = {
  parseApplication: (app: ApplicationDTO): EnsembleAppModel => {
    const customWidgets = (app.widgets ?? []).map(({ name, content: yaml }) =>
      EnsembleParser.parseWidget(name, parse(yaml) as EnsembleWidgetYAML),
    );

    const widgetApis: EnsembleAPIModel[] = flatMap(
      customWidgets,
      (widget) => widget.apis ?? [],
    );

    const screens = app.screens.map(({ id, name, content: yaml, ...rest }) => {
      const screen = parse(yaml) as EnsembleScreenYAML;
      const viewGroup = get(screen, "ViewGroup");
      if (viewGroup) {
        return EnsembleParser.parseMenu(viewGroup);
      }

      const pageScreen = EnsembleParser.parseScreen(id, name, screen, app);
      return {
        ...pageScreen,
        apis: concat(pageScreen.apis ?? [], widgetApis),
        ...rest,
      };
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
            (screen) => "name" in screen && screen.name === item.page,
          ) as EnsembleScreenModel),
      );
    }

    const theme = unwrapTheme(app.theme?.content);
    const scripts = app.scripts.map(({ name, content }) => ({
      name,
      body: content,
    }));

    const config = app.config;
    let ensembleConfigData;
    if (config) {
      ensembleConfigData = parse(config) as EnsembleConfigYAML;
    }

    return {
      id: app.id,
      menu,
      screens: screens as EnsembleScreenModel[],
      customWidgets,
      home: menu ?? screens[0],
      theme,
      scripts,
      config: ensembleConfigData,
    };
  },

  parseScreen: (
    id: string,
    name: string,
    screen: EnsembleScreenYAML,
    app: ApplicationDTO,
  ): EnsembleScreenModel => {
    const view = get(screen, "View");
    let viewNode = get(view, "body");
    const header = get(view, "header");
    const footer = get(view, "footer");

    if (!viewNode) {
      if (view) {
        // This is legacy declaration for body, so take our best guess here
        const {
          body: _body,
          header: _header,
          footer: _footer,
          title: _title,
          ...implicitBody
        } = view;
        viewNode = implicitBody;
      }
      if (isEmpty(viewNode)) {
        throw new Error("Invalid screen: missing view widget");
      }
    }
    const viewWidget = unwrapWidget(viewNode);
    const apis = unwrapApiModels(screen);

    const globalBlock = get(screen, "Global");
    const scriptName = get(globalBlock, "scriptName");
    let global: string | undefined;

    if (isString(scriptName)) {
      global = app.scripts.find(
        (script) => script.name === scriptName,
      )?.content;
    }

    if (isEmpty(global) && isString(globalBlock)) {
      global = globalBlock;
    }

    return {
      ...(view ?? {}),
      id,
      name,
      global,
      header: unwrapHeader(header),
      footer: unwrapFooter(footer),
      body: viewWidget,
      apis,
      styles: get(view, "styles"),
    };
  },

  parseWidget: (name: string, yaml: EnsembleWidgetYAML): CustomWidgetModel => {
    const widget = get(yaml, "Widget");

    const rawBody = get(widget, "body");
    if (!rawBody) {
      throw Error("Widget must have a body");
    }

    const body = unwrapWidget(rawBody);
    const apis = unwrapApiModels(yaml);
    return {
      name,
      onLoad: get(widget, "onLoad"),
      inputs: get(widget, "inputs") ?? [],
      body,
      apis,
    };
  },

  parseMenu: (menu: object): EnsembleMenuModel => {
    const menuType = head(Object.keys(menu));
    if (!menuType) {
      throw Error("Invalid ViewGroup definition: invalid menu type");
    }

    const headerDef = get(menu, [menuType, "header"]) as
      | { [key: string]: unknown }
      | undefined;
    const footerDef = get(menu, [menuType, "footer"]) as
      | { [key: string]: unknown }
      | undefined;
    return {
      id: get(menu, [menuType, "id"]) as string | undefined,
      type: String(menuType),
      items: get(menu, [menuType, "items"]) as [],
      header: headerDef ? unwrapWidget(headerDef) : undefined,
      footer: footerDef ? unwrapWidget(footerDef) : undefined,
      styles: get(menu, [menuType, "styles"]) as { [key: string]: unknown },
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

export const unwrapWidget = (obj: {
  [key: string]: unknown;
}): EnsembleWidget => {
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
    const unwrappedTemplate = unwrapWidget(
      template as { [key: string]: unknown },
    );
    set(properties as object, ["item-template", "template"], unwrappedTemplate);
  }
  if (!isEmpty(items) && isArray(items)) {
    if (isObject(items[0]) && "widget" in items[0]) {
      const valueItems = (items as { [key: string]: unknown }[]).map(
        ({ label, widget, icon }) => {
          const unwrappedWidget = unwrapWidget(
            widget as { [key: string]: unknown },
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
    properties: (properties ?? {}) as { [key: string]: unknown },
  };
};

export const unwrapHeader = (
  header: { [key: string]: unknown } | undefined,
): EnsembleHeaderModel | undefined => {
  const title = get(header, "title") as
    | { [key: string]: unknown }
    | string
    | undefined;

  if (!header || !title) return;

  return {
    title: typeof title === "string" ? title : unwrapWidget(title),
    styles: get(header, "styles") as { [key: string]: unknown },
  };
};

const unwrapFooter = (
  footer: { [key: string]: unknown } | undefined,
): EnsembleFooterModel | undefined => {
  if (!footer) return;

  const children = get(footer, "children");
  if (isArray(children)) {
    const unwrappedChildren = map(children, (child) =>
      unwrapWidget(child as { [key: string]: unknown }),
    );
    set(footer as object, "children", unwrappedChildren);

    return {
      children: unwrappedChildren,
      styles: get(footer, "styles") as { [key: string]: unknown },
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
