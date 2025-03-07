import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, path?: string) => Promise<ApplicationDTO>;
  delete: (appId: string) => Promise<void>;
}
