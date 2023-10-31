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
            (screen) => "name" in screen && screen.name === item.page,
          ) as EnsembleScreenModel),
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
    screen: EnsembleScreenYAML,
  ): EnsembleScreenModel | EnsembleMenuModel => {
    const view = get(screen, "View");
    const viewNode = get(view, "body");
    const header = get(view, "header") as EnsembleHeaderModel | undefined;
    const footer = get(view, "footer") as EnsembleFooterModel | undefined;

    if (!viewNode) {
      throw new Error("Invalid screen: missing view widget");
    }
    const viewWidget = unwrapWidget(viewNode);
    const body = unwrapBody(viewWidget, header, footer);
    const apis = unwrapApiModels(screen);

    return {
      ...(view ?? {}),
      name,
      header: header ? unwrapHeader(header) : undefined,
      footer: footer ? unwrapFooter(footer) : undefined,
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
  if (isArray(items) && !isEmpty(items)) {
    if ("widget" in items[0]) {
      const valueItems = (items as Record<string, unknown>[]).map(
        ({ label, widget, icon }) => {
          const unwrappedWidget = unwrapWidget(
            widget as Record<string, unknown>,
          );
          return { label, icon, widget: unwrappedWidget };
        },
      );
      set(properties as object, "items", valueItems);
    }
  }
  return {
    name,
    properties: properties as Record<string, unknown>,
  };
};

const unwrapBody = (
  viewWidget: EnsembleWidget,
  header: EnsembleHeaderModel | undefined,
  footer?: EnsembleFooterModel | undefined,
): EnsembleWidget => {
  const marginTop = !header
    ? "0px"
    : !header?.styles?.titleBarHeight
    ? "56px"
    : typeof header?.styles?.titleBarHeight === "number"
    ? header?.styles?.titleBarHeight + "px"
    : header?.styles?.titleBarHeight;
  const marginBottom = !footer
    ? "0px"
    : !("styles" in footer)
    ? "56px"
    : typeof footer?.styles?.height === "number"
    ? footer?.styles?.height + "px"
    : footer?.styles?.height;

  // default body styles
  const defaultStyles = {
    height: `calc(100vh - ${marginTop} - ${marginBottom})`,
    overflow: "auto",
    marginTop,
    marginBottom,
  };

  return {
    name: "Column",
    properties: {
      children: [viewWidget],
      styles: defaultStyles,
    },
  };
};

const unwrapHeader = (
  header: EnsembleHeaderModel | undefined,
): EnsembleHeaderModel | undefined => {
  const title = get(header, "title") as
    | Record<string, unknown>
    | string
    | undefined;

  // default header styles
  const defaultStyles = {
    position: "fixed",
    zIndex: 100,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: header?.styles?.centerTitle ? "center" : "flex-start",
    backgroundColor: header?.styles?.backgroundColor || "white",
    height: header?.styles?.titleBarHeight || 56,
    paddingRight:
      document.getElementById("ensemble-sidebar")?.style?.width || "unset",
  };

  if (typeof title === "string") {
    return {
      title: {
        name: "Column",
        properties: {
          styles: defaultStyles,
          children: [
            {
              name: "Text",
              properties: {
                text: title,
                styles: {
                  color: header?.styles?.color,
                },
              },
            },
          ],
        },
      },
    };
  } else if (isObject(title)) {
    const unwrappedTitle = unwrapWidget(title);

    if (unwrappedTitle.properties.styles)
      unwrappedTitle.properties.styles = {
        ...unwrappedTitle.properties.styles,
        color: header?.styles?.color,
      };
    else
      unwrappedTitle.properties.styles = {
        color: header?.styles?.color,
      };

    return {
      title: {
        name: "Column",
        properties: {
          styles: defaultStyles,
          children: [unwrappedTitle],
        },
      },
    };
  }
};

const unwrapFooter = (
  footer: EnsembleFooterModel | undefined,
): EnsembleFooterModel | undefined => {
  if (!footer) return undefined;

  const givenStyles = footer && "styles" in footer ? footer.styles : undefined;

  // default footer styles
  const defaultStyles = {
    position: "fixed",
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: givenStyles?.width || "100%",
    backgroundColor: givenStyles?.backgroundColor || "white",
    height: givenStyles?.height || "56px",
    top: `calc(100vh - ${
      (typeof givenStyles?.height === "number"
        ? givenStyles?.height + "px"
        : givenStyles?.height) || "56px"
    })`,
    paddingRight:
      document.getElementById("ensemble-sidebar")?.style?.width || "unset",
  };

  if ("children" in footer) {
    const children = footer.children.map((child) =>
      unwrapWidget(child as unknown as Record<string, unknown>),
    );

    return {
      name: "Column",
      properties: {
        styles: defaultStyles,
        children,
      },
    };
  } else {
    const unwrappedFooter = unwrapWidget(
      footer as unknown as Record<string, unknown>,
    );

    return {
      name: "Column",
      properties: {
        styles: defaultStyles,
        children: [unwrappedFooter],
      },
    };
  }
};
