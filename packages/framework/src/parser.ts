import { parse } from "yaml";
import { get, head, isArray, map, set } from "lodash-es";
import type { EnsembleScreen, Widget } from "./models";

export const EnsembleParser = {
  parseScreen: (name: string, yaml: string): EnsembleScreen => {
    const screen: unknown = parse(yaml);
    const view = get(screen, "View");
    const viewNode = get(view, "body");
    if (!viewNode) {
      throw new Error("Invalid screen: missing view widget");
    }
    const viewWidget = unwrapWidget(viewNode);
    return {
      name,
      header: get(view, "header"),
      body: viewWidget,
    };
  },
};

export const unwrapWidget = (obj: Record<string, unknown>): Widget => {
  const name = head(Object.keys(obj));
  if (!name) {
    throw Error("Invalid widget definition");
  }
  const properties = get(obj, name);
  const children = get(properties, "children");
  if (isArray(children)) {
    const unwrappedChildren = map(children, unwrapWidget);
    set(properties as object, "children", unwrappedChildren);
  }
  return {
    name,
    properties: properties as Record<string, unknown>,
  };
};
