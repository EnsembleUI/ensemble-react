import type { Expression } from "./common";

export type ExecuteCodeAction =
  | string
  | {
      body: string;
      onComplete?: EnsembleAction;
    };

export interface InvokeAPIAction {
  name: string;
  inputs: Record<string, Expression<unknown>>;
  onResponse?: EnsembleAction;
  onError?: EnsembleAction;
}

export type NavigateModalScreenAction =
  | string
  | {
      name?: string;
      maskClosable?: boolean;
    };

export type NavigateScreenAction = string;

export interface ShowToastAction {
  message: string;
  options: {
    type: "success" | "warning" | "info" | "error";
  };
  dismissable?: boolean;
  duration?: number;
}

export interface EnsembleAction {
  executeCode?: ExecuteCodeAction;
  invokeApi?: InvokeAPIAction;
  navigateScreen?: NavigateScreenAction;
  navigateModalScreen?: NavigateModalScreenAction;
  showToast?: ShowToastAction;
  closeAllDialogs?: null;
}
