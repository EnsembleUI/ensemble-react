import type { Expression } from "./common";

export type ExecuteCodeAction =
  | string
  | {
      body: string;
      onComplete?: EnsembleAction;
    }
  | {
      scriptName: string;
      onComplete?: EnsembleAction;
    };

export interface InvokeAPIAction {
  name: string;
  inputs: Record<string, Expression<unknown>>;
  onResponse?: EnsembleAction;
  onError?: EnsembleAction;
}

export interface NavigateModalScreenStyles {
  position?: "top" | "right" | "bottom" | "left";
  height?: string;
  width?: string;
  margin?: string;
  padding?: string;
}

interface NavigateScreenOptions {
  name: string;
  inputs: Record<string, unknown>;
}

export type NavigateModalScreenAction =
  | string
  | (NavigateScreenOptions & {
      maskClosable?: boolean;
      styles?: NavigateModalScreenStyles;
    });

export type NavigateScreenAction = string | NavigateScreenOptions;

export interface ShowToastAction {
  message: string;
  options: {
    type: "success" | "warning" | "info" | "error";
  };
  dismissable?: boolean;
  duration?: number;
}

export interface PickFilesAction {
  id: string;
  allowMultiple?: boolean;
  allowedExtensions?: string[];
  onComplete?: EnsembleAction;
}

export interface UploadFilesAction {
  uploadApi: string;
  files: string;
  id?: string;
  inputs?: Record<string, unknown>;
  fieldName?: string;
  onComplete?: EnsembleAction;
  onError: EnsembleAction;
}

export interface EnsembleAction {
  executeCode?: ExecuteCodeAction;
  invokeApi?: InvokeAPIAction;
  navigateScreen?: NavigateScreenAction;
  navigateModalScreen?: NavigateModalScreenAction;
  showToast?: ShowToastAction;
  closeAllDialogs?: null;
  pickFiles?: PickFilesAction;
  uploadFiles?: UploadFilesAction;
}
