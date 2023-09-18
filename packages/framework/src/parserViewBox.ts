import { parse } from "yaml";
import { get, head, isArray, isEmpty, map, set } from "lodash-es";
import type { EnsembleScreenVG, Widget } from "./models";
import { unwrapWidget } from "./parser";
export const EnsembleParserVG = {
    parseScreen: (name: string, yaml: string): EnsembleScreenVG => {
        const screen: unknown = parse(yaml);
        const view = get(screen, "ViewGroup");
        const viewMenu = get(view, "Menu");
        const viewNode = get(view, "body");
        if (!viewNode) {
            throw new Error(
                `Invalid screen: missing viewGroup widget:\n${isEmpty(yaml) ? "Bad YAML" : yaml
                }`,
            );
        }
        if (!viewMenu) {
            throw new Error(
                `Invalid screen: missing viewMenu widget:\n${isEmpty(yaml) ? "Bad YAML" : yaml
                }`,
            );
        }
        const viewWidget = unwrapWidget(viewNode);
        const menuWidget = unwrapWidget(viewMenu);
        return {
            name,
            header: get(view, "header"),
            body: viewWidget,
            menu: menuWidget,
        };
    },
};

// export const unwrapWidget = (obj: Record<string, unknown>): Widget => {
//     const name = head(Object.keys(obj));
//     if (!name) {
//         throw Error("Invalid widget definition");
//     }
//     const properties = get(obj, name);
//     const children = get(properties, "children");
//     if (isArray(children)) {
//         const unwrappedChildren = map(children, unwrapWidget);
//         set(properties as object, "children", unwrappedChildren);
//     }
//     return {
//         name,
//         properties: properties as Record<string, unknown>,
//     };
// };
