import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO) => Promise<ApplicationDTO>;
  getYamlContent: (
    appId: string,
    documentId: string,
    documentType: string,
  ) => Promise<string>;
  updateYamlContent: (
    appId: string,
    documentId: string,
    documentType: string,
    content: string,
  ) => Promise<void>;
  putAppYaml: (app: ApplicationDTO) => Promise<void>;
}
