import type { Application } from "./models";

export const ApplicationLoader = {
  load: (_id: string): Application => {
    throw Error("Not implemented");
  },
};
