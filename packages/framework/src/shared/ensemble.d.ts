export interface EnsembleInterface {
  storage: EnsembleStorage;
  formatter: Partial<EnsembleFormatter>;
  app: EnsembleAppConfig;
  env: EnsembleEnvConfig;
  secrets: EnsembleSecretsConfig;
  user?: EnsembleUser;
  device: EnsembleDeviceInfo;
  navigateScreen: (screenName: string, inputs?: unknown[]) => void;
  navigateModalScreen: (screenName: string, inputs?: unknown[]) => void;
  showDialog: (widget: unknown) => void;
  invokeAPI: (apiName: string, inputs?: unknown[]) => void;
  stopTimer: (timerId: string) => void;
  openCamera: () => void;
  navigateBack: () => void;
  showToast: (inputs: unknown) => void;
  debug: (value: unknown) => void;
  copyToClipboard: (value: unknown) => void;
}

interface EnsembleApiResponse {
  body: { data: unknown } & Record<string, unknown>;
  headers: Record<string, unknown>;
  progress: number;
}