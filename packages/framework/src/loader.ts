import type { ApplicationDTO } from "./shared/dto";

export const ApplicationLoader = {
  load: (_id: string): ApplicationDTO => {
    throw Error("Not implemented");
  },
};
