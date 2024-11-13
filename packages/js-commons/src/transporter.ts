import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO) => Promise<ApplicationDTO>;
  updateYamlContent: (
    appId: string,
    artifactId: string,
    artifactName: string,
    artifactType: string,
    content: string,
  ) => Promise<void>;
}
