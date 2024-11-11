import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO | null>;
  put: (app: ApplicationDTO) => Promise<void>;
}

export interface YamlApplicationTransporter {
  get: (
    appId: string,
    documentId: string,
    documentType: string,
  ) => Promise<string>;
  put: (app: ApplicationDTO) => Promise<void>;
}
