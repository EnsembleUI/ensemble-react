import type { ApplicationDTO } from "./dto";

export interface ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, userId: string) => Promise<ApplicationDTO>;
  storeAsset: (
    appId: string,
    fileName: string,
    fileData: string | Buffer,
    isFont?: boolean,
    fontFamily?: string,
    weight?: number,
    fontStyle?: string,
    fontType?: string,
  ) => Promise<void>;
  removeAsset: (
    appId: string,
    documentId: string,
    isFont?: boolean,
  ) => Promise<void>;
}

export interface LocalApplicationTransporter extends ApplicationTransporter {
  get: (appId: string) => Promise<ApplicationDTO>;
  put: (app: ApplicationDTO, path?: string) => Promise<ApplicationDTO>;
}
