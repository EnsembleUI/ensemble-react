import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO) => Promise<ApplicationDTO>;
}

export interface YamlApplicationTransporter {
  get: (
    appId: string,
    documentId: string,
    documentType: string,
  ) => Promise<string>;
  update: (
    appId: string,
    documentId: string,
    documentType: string,
    content: string,
  ) => Promise<void>;
  put: (app: ApplicationDTO) => Promise<void>;
}
