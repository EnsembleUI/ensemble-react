import { parse } from "yaml";
import { get, head, isArray, isEmpty, isObject, map, set } from "lodash-es";
import type { APIModel, EnsembleScreenModel, Widget } from "./models";

export const EnsembleParser = {
  parseScreen: (name: string, yaml: string): EnsembleScreenModel => {
    const screen: object = parse(yaml) as object;
    const view = get(screen, "View");
    const viewNode = get(view, "body");
    if (!viewNode) {
      throw new Error(
        `Invalid screen: missing view widget:\n${isEmpty(yaml) ? "Bad YAML" : yaml
        }`,
      );
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
};

const unwrapApiModels = (screen: unknown): APIModel[] => {
  const apiNode = get(screen, "API");
  if (isArray(apiNode)) {
    return map<object, APIModel>(apiNode, (value) => {
      const name = head(Object.keys(value));
      return {
        name,
        ...value,
      } as APIModel;
    });
  }
  if (isObject(apiNode)) {
    return map(Object.entries<object>(apiNode), ([name, value]) => {
      return {
        name,
        ...value,
      } as APIModel;
    });
  }
  return [];
};

export const unwrapWidget = (obj: Record<string, unknown>): Widget => {
  const name = head(Object.keys(obj));
  if (!name) {
    throw Error("Invalid widget definition");
  }
  console.log(obj,"objjjjjjjjjj");
  const properties = get(obj, name);
  const children = get(properties, "children");
  const template = get(properties, ["item-template", "template"]) as unknown;
  const items = get(properties, "items");
  const widget = get(properties, "widget");
  console.log("widgetttttttttttttt----------------------------", widget);
  if (isArray(children)) {
    const unwrappedChildren = map(children, unwrapWidget);
    set(properties as object, "children", unwrappedChildren);
  }
  if (isObject(template)) {
    const unwrappedTemplate = unwrapWidget(template as Record<string, unknown>);
    set(properties as object, ["item-template", "template"], unwrappedTemplate);
  }
  if (isArray(items)) {
    console.log("items****************************");
    //unwrapWidget(items);
    //map(items, unwrapWidget)
    //map(items as object, unwrapWidget);
    //set(properties as object, "items", unwrappedItems);
    (items as Array<any>).map((item) => {
      const unwrappedWidget = unwrapWidget(item[1]);
      //return { label, widget: unwrappedWidget }
    })
  }
  if (isObject(widget)) {
    console.log("is widget &&&&&&&&&&&&&&&&");
    const unwrappedWidget = unwrapWidget(widget);
    set(properties as object, "widget", unwrappedWidget);
  }
  return {
    name,
    properties: properties as Record<string, unknown>,
  };
};
