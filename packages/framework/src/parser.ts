import { parse } from "yaml";
import {
  flatMap,
  get,
  head,
  isArray,
  isEmpty,
  isObject,
  map,
  remove,
  set,
  isString,
  concat,
  filter,
  includes,
  omit,
  keys,
  merge,
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
  EnsembleSocketModel,
  EnsembleCustomEventModel,
  JoshMenuType,
  JoshDrawerType,
} from "./shared/models";
import type {
  ApplicationDTO,
  EnsembleConfigYAML,
  LanguageDTO,
} from "./shared/dto";
import { type EnsembleAction } from "./shared";
import { defaultThemeDefinition } from "./state";

export interface EnsembleScreenYAML {
  View?: {
    header?: { [key: string]: unknown };
    body: { [key: string]: unknown };
    footer?: { [key: string]: unknown };
    styles?: { [key: string]: unknown };
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

export type EnsembleThemeYAML = {
  Themes?: [string];
} & EnsembleThemeModel & { [key: string]: EnsembleThemeModel };

export const EnsembleParser = {
  parseApplication: (app: ApplicationDTO): EnsembleAppModel => {
    const customWidgets = (app.widgets ?? []).map(({ name, content: yaml }) =>
      EnsembleParser.parseWidget(name, parse(yaml) as EnsembleWidgetYAML),
    );

    const widgetApis: EnsembleAPIModel[] = flatMap(
      customWidgets,
      (widget) => widget.apis ?? [],
    );

    const widgetCustomEvents: EnsembleCustomEventModel[] = flatMap(
      customWidgets,
      (widget) => widget.events ?? [],
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
        events: widgetCustomEvents,
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

    const themes = unwrapTheme(app.theme?.content);

    const scripts = app.scripts.map(({ name, content }) => ({
      name,
      body: content,
    }));

    const config = app.config;
    let ensembleConfigData;
    if (config) {
      ensembleConfigData = isString(config)
        ? (parse(config) as EnsembleConfigYAML)
        : config;
    }

    const languages = app.languages?.map((language) =>
      unwrapLanguage(language),
    );

    return {
      id: app.id,
      menu,
      screens: screens as EnsembleScreenModel[],
      customWidgets,
      home:
        menu ||
        (screens as EnsembleScreenModel[]).find((screen) => screen.isRoot) ||
        screens[0],
      themes: themes || { default: defaultThemeDefinition },
      scripts,
      config: ensembleConfigData,
      languages,
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
    const menu = get(view, "menu");

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
    const sockets = unwrapSocketModels(screen);

    // handle global block
    const globalBlock = get(screen, "Global");
    const scriptName = get(globalBlock, "scriptName");
    let global: string | undefined;

    if (isString(scriptName)) {
      const globalContent = app.scripts.find(
        (script) => script.name === scriptName,
      );
      global = globalContent?.content;
    }

    if (isEmpty(global) && isString(globalBlock)) {
      global = globalBlock;
    }

    // handle import block
    const importBlock = get(screen, "Import");
    let importedScripts: string | undefined;
    if (isArray(importBlock)) {
      const matchingScripts = filter(app.scripts, (script) =>
        includes(importBlock, script.name),
      );

      importedScripts = matchingScripts.reduce(
        (acc, script) => acc.concat(script.content, "\n\n"),
        "",
      );
    }

    const widgets = omit(screen, ["View", "Global", "API", "Import", "Socket"]);
    const customWidgets = keys(widgets).map((widgetName) =>
      EnsembleParser.parseWidget(widgetName, {
        Widget: get(widgets, widgetName) as { [key: string]: unknown },
      } as EnsembleWidgetYAML),
    );

    return {
      ...(view ?? {}),
      id,
      name,
      global,
      header: unwrapHeader(header),
      footer: unwrapFooter(footer),
      menu: unwrapMenu(menu),
      body: viewWidget,
      apis,
      styles: get(view, "styles"),
      importedScripts,
      customWidgets,
      sockets,
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
    const events = unwrapCustomEventsModels(widget);

    return {
      name,
      onLoad: get(widget, "onLoad"),
      inputs: get(widget, "inputs") ?? [],
      body,
      apis,
      events,
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
    const drawerDef = get(menu, [menuType, "drawer"]) as
      | { [key: string]: unknown }
      | undefined;
    return {
      id: get(menu, [menuType, "id"]) as string | undefined,
      type: String(menuType),
      items: get(menu, [menuType, "items"]) as [],
      header: headerDef ? unwrapWidget(headerDef) : undefined,
      footer: footerDef ? unwrapWidget(footerDef) : undefined,
      drawer: drawerDef ? unwrapWidget(drawerDef) : undefined,
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

const unwrapSocketModels = (screen: unknown): EnsembleSocketModel[] => {
  const socketNode = get(screen, "Socket");
  if (isArray(socketNode)) {
    return map<object, EnsembleSocketModel>(socketNode, (value) => {
      const name = head(Object.keys(value));
      return {
        name,
        ...value,
      } as EnsembleSocketModel;
    });
  }

  if (isObject(socketNode)) {
    return map(Object.entries<object>(socketNode), ([name, value]) => {
      return {
        name,
        ...value,
      } as EnsembleSocketModel;
    });
  }

  return [];
};

const unwrapCustomEventsModels = (
  widget: unknown,
): EnsembleCustomEventModel[] => {
  const eventNode = get(widget, "events");
  if (isArray(eventNode)) {
    return map<object, EnsembleCustomEventModel>(eventNode, (value) => {
      const name = head(Object.keys(value));
      return {
        name,
        ...value,
      } as EnsembleCustomEventModel;
    });
  }
  if (isObject(eventNode)) {
    return map(Object.entries<object>(eventNode), ([name, value]) => {
      return {
        name,
        ...value,
      } as EnsembleCustomEventModel;
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

const unwrapTheme = (
  theme?: string,
): { [key: string]: EnsembleThemeModel } | undefined => {
  if (!theme || isEmpty(theme)) {
    return;
  }

  const workingTheme = parse(theme) as EnsembleThemeYAML;
  if (!workingTheme) {
    return;
  }

  // if no themes provided then use theme file as default theme
  if (isEmpty(workingTheme.Themes)) {
    workingTheme.default = { ...workingTheme };
    workingTheme.Themes = ["default"];
  }

  const themes = workingTheme.Themes?.reduce(
    (acc: { [key: string]: EnsembleThemeModel }, themeName: string) => {
      const themeContent = get(workingTheme, themeName);

      acc[themeName] = merge({}, themeContent, {
        name: themeName,
      }) as EnsembleThemeModel;
      return acc;
    },
    {},
  );

  return themes;
};

const unwrapLanguage = (language: LanguageDTO) => {
  return {
    ...language,
    resources: parse(language.content) as { [key: string]: unknown },
  };
};

const unwrapMenu = (
  menu: { [key: string]: unknown } | undefined,
): JoshMenuType | undefined => {
  if (!menu || !get(menu, "Drawer")) return;
  const drawerMenu = get(menu, "Drawer");
  const unwrapedChildren = (get(drawerMenu, "children") || []).map((child) => unwrapWidget(child as { [key: string]: unknown }));
  return {
    Drawer: {
      id: get(drawerMenu, "id"),
      height: get(drawerMenu, "height"),
      width: get(drawerMenu, "width"),
      position: get(drawerMenu, "position"),
      onClose: get(drawerMenu, "onClose"),
      title: get(drawerMenu, "title"),
      children: unwrapedChildren,
    }
  }
};