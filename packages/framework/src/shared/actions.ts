import type { Expression } from "./common";

/**
 * Execute a block of code
 */
export type ExecuteCodeAction =
  | string
  | {
      /** The code to execute */
      body: string;
      /** Execute another Action when the code body finishes executing */
      onComplete?: EnsembleAction;
    }
  | {
      /** The script name to execute */
      scriptName: string;
      /** Execute another Action when the code body finishes executing */
      onComplete?: EnsembleAction;
    };

export interface InvokeAPIAction {
  /** Enable binding to the API using this id. Binding to the API name is available globally, while binding to this id is useful in a local scope (e.g. access the API in a loop) */
  id?: string;
  /** Specify the API name to invoke */
  name: string;
  /** Specify the key/value pairs to pass into the API */
  inputs?: { [key: string]: Expression<unknown> };
  /** Forcefully clears the cache for this API invocation */
  bypassCache?: boolean;
  /** execute an Action upon successful completion of the API */
  onResponse?: EnsembleAction;
  /** execute an Action upon error */
  onError?: EnsembleAction;
}

export interface ConnectSocketAction {
  name: string;
}

export interface SendSocketMessageAction {
  name: string;
  message: { [key: string]: unknown };
}

export interface DisconnectSocketAction {
  name: string;
}

export interface NavigateModalScreenStyles {
  position?: "top" | "right" | "bottom" | "left";
  height?: string;
  width?: string;
  margin?: string;
  padding?: string;
}

interface NavigateScreenOptions {
  /** Specify the screen name or the screen id to navigate to */
  name: string;
  /** Specify the key/value pairs to pass into the next Screen */
  inputs: { [key: string]: unknown };
}

interface NavigateUrlOptions {
  url: string;
  inputs?: { [key: string]: unknown };
}

interface NavigateExternalScreenOptions {
  url: string;
  openNewTab?: boolean;
  external?: boolean;
}

export type NavigateModalScreenAction =
  | string
  | (NavigateScreenOptions & {
      maskClosable?: boolean;
      mask?: boolean;
      hideFullScreenIcon?: boolean;
      hideCloseIcon?: boolean;
      title?: string | { [key: string]: unknown };
      styles?: NavigateModalScreenStyles;
      onModalDismiss?: EnsembleAction;
    });

export type NavigateScreenAction = string | NavigateScreenOptions;

export type NavigateUrlAction = string | NavigateUrlOptions;

export type NavigateBackAction = null;

export type NavigateExternalScreen = string | NavigateExternalScreenOptions;

export interface ShowDialogOptions {
  mask?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  horizontalOffset?: number;
  verticalOffset?: number;
  style?: "default" | "none";
}

export interface ShowDialogAction {
  widget?: { [key: string]: unknown };
  body?: { [key: string]: unknown };
  options?: ShowDialogOptions;
  onDialogDismiss?: EnsembleAction;
}

export interface ShowToastAction {
  message: string;
  options: {
    type: "success" | "warning" | "info" | "error";
    position:
      | "top"
      | "topLeft"
      | "topRight"
      | "center"
      | "centerLeft"
      | "centerRight"
      | "bottom"
      | "bottomLeft"
      | "bottomRight";
  };
  dismissable?: boolean;
  duration?: number;
}

export interface PickFilesAction {
  id?: string;
  allowMultiple?: boolean;
  allowedExtensions?: string[];
  allowMaxFileSizeBytes?: number;
  onComplete?: EnsembleAction;
  onError?: EnsembleAction;
}

export interface UploadFilesAction {
  uploadApi: string;
  files: string;
  id?: string;
  inputs?: { [key: string]: unknown };
  fieldName?: string;
  onComplete?: EnsembleAction;
  onError: EnsembleAction;
}

export type CloseAllDialogsAction = null;

export type CloseAllScreensAction = null;

export interface ExecuteActionGroupAction {
  actions: EnsembleAction[];
}

export interface ExecuteConditionalActionAction {
  conditions: (
    | {
        action: EnsembleAction;
        if: Expression<boolean>;
        elseif?: never;
        else?: never;
      }
    | {
        action: EnsembleAction;
        elseif: Expression<boolean>;
        if?: never;
        else?: never;
      }
    | { action: EnsembleAction; else: null; if?: never; elseif?: never }
  )[];
}

export type EnsembleActionHookResult =
  | {
      callback: (...args: unknown[]) => unknown;
    }
  | undefined;

export interface DispatchEventAction {
  [k: string]: unknown;
}

/**
 * @uiType action
 */
export type EnsembleAction =
  | string
  | {
      executeCode?: ExecuteCodeAction;
    }
  | { invokeApi?: InvokeAPIAction }
  | { invokeAPI?: InvokeAPIAction }
  | { navigateBack?: NavigateBackAction }
  | { navigateScreen?: NavigateScreenAction }
  | { navigateModalScreen?: NavigateModalScreenAction }
  | { navigateExternalScreen?: NavigateExternalScreen }
  | { openUrl?: NavigateExternalScreen } // this is needed for support the flutter compatibility
  // | { navigateViewGroup?: NavigateViewGroup }
  // | { showBottomModal?: ShowBottomModal }
  // | { dismissBottomModal?: DismissBottomModal }
  | { showDialog?: ShowDialogAction }
  | { closeAllDialogs?: CloseAllDialogsAction }
  | { closeAllScreens?: CloseAllScreensAction }
  | { showToast?: ShowToastAction }
  // | { startTimer?: StartTimer }
  // | { stopTimer?: StopTimer }
  // | { callExternalMethod?: CallExternalMethod }
  // | { callNativeMethod?: CallNativeMethod }
  // | { getLocation?: GetLocation }
  // | { openCamera?: OpenCamera }
  | { uploadFiles?: UploadFilesAction }
  | { pickFiles?: PickFilesAction }
  | { navigateUrl?: NavigateUrlAction }
  | { executeActionGroup?: ExecuteActionGroupAction }
  | { executeConditionalAction?: ExecuteConditionalActionAction }
  | { connectSocket?: ConnectSocketAction }
  | { messageSocket?: SendSocketMessageAction }
  | { disconnectSocket?: DisconnectSocketAction }
  | { dispatchEvent?: DispatchEventAction };

export interface InvokeAPIOptions {
  bypassCache?: boolean;
}
