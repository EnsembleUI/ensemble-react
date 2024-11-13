import type { ApplicationDTO, EnsembleDocument } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO) => Promise<ApplicationDTO>;
  saveArtifact: (appId: string, artifact: EnsembleDocument) => Promise<void>;
}
