import { parse } from "yaml";
import { get } from "lodash-es";
import type { EnsembleScreen, Widget } from "./models";

export const EnsembleParser = {
  parseScreen: (name: string, yaml: string): EnsembleScreen => {
    const screen: unknown = parse(yaml);
    const view = get(screen, "View");
    const viewWidget = get(view, "body");
    if (!viewWidget) {
      throw new Error("Invalid screen: missing view widget");
    }
    return {
      name,
      header: get(view, "header"),
      body: viewWidget as Widget,
    };
  },
};
