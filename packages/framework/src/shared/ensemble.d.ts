import type { Response } from "../data";
import type { ShowDialogAction } from "./actions";

export interface EnsembleContext {
  app: EnsembleAppConfig;
  env: EnsembleEnvConfig;
  ensemble: EnsembleInterface;
  [k: string]: unknown;
}
export interface EnsembleInterface {
  storage: EnsembleStorage;
  formatter: Partial<EnsembleFormatter>;
  app: EnsembleAppConfig;
  env: EnsembleEnvConfig;
  secrets: EnsembleSecretsConfig;
  user?: EnsembleUser;
  device: EnsembleDeviceInfo;
  location: EnsembleLocation;
  navigateScreen: (screenName: string, inputs?: unknown[]) => void;
  navigateUrl: (url: string, inputs?: { [key: string]: unknown }) => void;
  navigateModalScreen: (screenName: string, inputs?: unknown[]) => void;
  navigateExternalScreen: (url: NavigateExternalScreen) => void;
  openUrl: (url: NavigateExternalScreen) => void;
  showDialog: (action: ShowDialogAction) => void;
  closeAllDialogs: () => void;
  invokeAPI: (
    apiName: string,
    apiInputs?: { [key: string]: unknown },
  ) => Promise<Response | undefined>;
  stopTimer: (timerId: string) => void;
  openCamera: () => void;
  navigateBack: () => void;
  showToast: (inputs: unknown) => void;
  debug: (value: unknown) => void;
  copyToClipboard: (value: unknown) => void;
  connectSocket: (name: string) => void;
  messageSocket: (name: string, message: { [key: string]: unknown }) => void;
  disconnectSocket: (name: string) => void;
  setLocale: ({ languageCode }: { languageCode: string }) => unknown;
}

interface EnsembleApiResponse {
  body: { data: unknown } & { [key: string]: unknown };
  headers: { [key: string]: unknown };
  progress: number;
}

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

interface EnsembleAppConfig {
  useMockResponse: boolean;
  setUseMockresponse?: (value: boolean) => void;
}

interface EnsembleUser {
  [k: string]: unknown;
}

export interface EnsembleLocationInterface {
  pathname?: string;
  search?: string;
}

export interface EnsembleLocation {
  get: (key: keyof EnsembleLocationInterface) => string | undefined;
}
