import {
  DataFetcher,
  useScreenContext,
  evaluate,
  isExpression,
  useRegisterBindings,
  error as logError,
  ensembleStore,
  screenAtom,
  useScreenData,
  useEnsembleStorage,
  DateFormatter,
  useApplicationContext,
  unwrapWidget,
} from "@ensembleui/react-framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  Response,
  EnsembleAction,
  PickFilesAction,
  UploadFilesAction,
  ScreenContextDefinition,
  ShowDialogAction,
  NavigateScreenAction,
} from "@ensembleui/react-framework";
import { isEmpty, isString, merge, isObject, get, set } from "lodash-es";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateApi, navigateUrl } from "../navigation";
import { locationApi } from "../locationApi";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useNavigateScreen } from "./useNavigateScreen";
import { useShowToast } from "./useShowToast";
import { useCloseAllDialogs } from "./useCloseAllDialogs";
import { useNavigateUrl } from "./useNavigateUrl";

export type EnsembleActionHookResult =
  | {
      callback: (...args: unknown[]) => unknown;
    }
  | undefined;
export type EnsembleActionHook<
  T = unknown,
  Q = unknown,
  R extends EnsembleActionHookResult = EnsembleActionHookResult,
> = (action?: T, options?: Q) => R;

type UploadStatus =
  | "pending"
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

export interface UseExecuteCodeActionOptions {
  context?: Record<string, unknown>;
}

export const useExecuteCode: EnsembleActionHook<
  ExecuteCodeAction,
  UseExecuteCodeActionOptions
> = (action, options) => {
  const isCodeString = isString(action);
  const screen = useScreenContext();
  const storage = useEnsembleStorage();
  const formatter = DateFormatter();
  const navigate = useNavigate();
  const location = useLocation();

  const js = useMemo(() => {
    if (!action) {
      return;
    }
    if (isCodeString) {
      return action;
    }

    if ("body" in action) {
      return action.body;
    }

    if ("scriptName" in action) {
      return screen?.app?.scripts.find(
        (script) => script.name === action.scriptName,
      )?.body;
    }
  }, [action, isCodeString, screen]);

  const appContext = useApplicationContext();
  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete,
  );

  const execute = useMemo(() => {
    if (!screen || !js) {
      return;
    }

    return (args: unknown) => {
      try {
        const retVal = evaluate(
          screen,
          js,
          merge(
            {
              ensemble: {
                storage,
                formatter,
                env: appContext?.env,
                navigateScreen: (targetScreen: NavigateScreenAction): void =>
                  navigateApi(targetScreen, screen, navigate),
                location: locationApi(location),
                navigateUrl: (url: string, inputs?: Record<string, unknown>) =>
                  navigateUrl(url, navigate, inputs),
              },
            },
            options?.context,
            args,
          ),
        );
        onCompleteAction?.callback();
        return retVal;
      } catch (e) {
        logError(e);
      }
    };
  }, [
    screen,
    js,
    storage,
    formatter,
    appContext?.env,
    location,
    navigate,
    options?.context,
    onCompleteAction,
  ]);

  return execute ? { callback: execute } : undefined;
};

export const useInvokeApi: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const { apis, setData } = useScreenData();
  const [response, setResponse] = useState<Response>();
  const [error, setError] = useState<unknown>();
  const [isComplete, setIsComplete] = useState(false);
  const storage = useEnsembleStorage();

  const invokeApi = useMemo(() => {
    if (!apis || !action) {
      return;
    }

    const apiModel = apis?.find((model) => model.name === action.name);
    if (!apiModel) {
      return;
    }

    const inputs = action.inputs ?? {};
    const callback = async (context: unknown): Promise<void> => {
      setIsComplete(false);
      const resolvedInputs = Object.entries(inputs).map(([key, value]) => {
        if (isExpression(value)) {
          const evalContext = ensembleStore.get(screenAtom);
          const resolvedValue = evaluate(evalContext, value, {
            ...(context as Record<string, unknown>),
            ensemble: { storage },
          } as Record<string, unknown>);
          return [key, resolvedValue];
        }
        return [key, value];
      });
      setData(apiModel.name, {
        isLoading: true,
        isSuccess: false,
        isError: false,
      });
      try {
        const res = await DataFetcher.fetch(
          apiModel,
          Object.fromEntries(resolvedInputs) as Record<string, unknown>,
        );
        setData(apiModel.name, res);
        setResponse(res);
      } catch (e) {
        logError(e);
        setError(e);
      }
    };
    return { callback };
  }, [action, storage, apis, setData]);

  const onResponseAction = useEnsembleAction(action?.onResponse);
  useEffect(() => {
    if (!response || isComplete) {
      return;
    }
    onResponseAction?.callback({ response });
    setIsComplete(true);
  }, [isComplete, onResponseAction, response]);

  const onErrorAction = useEnsembleAction(action?.onError);
  useEffect(() => {
    if (!error || isComplete) {
      return;
    }
    onErrorAction?.callback({ error });
    setIsComplete(true);
  }, [error, isComplete, onErrorAction]);

  return invokeApi;
};

const noneStyleOption = {
  backgroundColor: "transparent",
  showShadow: false,
};

export const useShowDialog: EnsembleActionHook<ShowDialogAction> = (
  action?: ShowDialogAction,
) => {
  const { openModal } = useContext(ModalContext) || {};
  const ensembleAction = useEnsembleAction(action?.onDialogDismiss);

  const onDismissCallback = useCallback(() => {
    if (!ensembleAction) {
      return;
    }
    ensembleAction.callback();
  }, [ensembleAction]);

  if (!action?.widget)
    throw new Error("ShowDialog Action requires a widget to be specified");

  const callback = useCallback(() => {
    const widget = unwrapWidget(action.widget);

    const widgetBackgroundColor = get(
      widget,
      "properties.styles.backgroundColor", // FIXME: works only for inline widget
    );
    if (widgetBackgroundColor && isString(widgetBackgroundColor)) {
      set(noneStyleOption, "backgroundColor", widgetBackgroundColor);
    }

    openModal?.(
      EnsembleRuntime.render([widget]),
      {
        maskClosable: true,
        hideCloseIcon: true,
        hideFullScreenIcon: true,
        onClose: onDismissCallback,
        verticalOffset: action?.options?.verticalOffset,
        horizontalOffset: action?.options?.horizontalOffset,
        padding: "12px",
        ...(action?.options?.style === "none" ? noneStyleOption : {}),
      },
      true,
    );
  }, [openModal, action.widget, onDismissCallback, action?.options]);

  return { callback };
};

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const [files, setFiles] = useState<FileList>();
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteAction = useEnsembleAction(action?.onComplete);

  const { values } = useRegisterBindings(
    {
      files,
    },
    action?.id,
    {
      setFiles,
    },
  );

  const inputEl = useMemo(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = action?.allowMultiple || false;
    input.accept =
      action?.allowedExtensions?.map((ext) => ".".concat(ext))?.toString() ||
      "*/*";

    input.onchange = (event: Event): void => {
      const selectedFiles =
        (event.target as HTMLInputElement).files || undefined;

      if (selectedFiles) {
        setIsComplete(false);
        setFiles(selectedFiles);
      }
    };

    return input;
  }, [action?.allowMultiple, action?.allowedExtensions]);

  useEffect(() => {
    return () => {
      inputEl.remove();
    };
  }, [inputEl]);

  useEffect(() => {
    if (!isEmpty(values?.files) && !isComplete) {
      onCompleteAction?.callback();
      setIsComplete(true);
    }
  }, [values?.files, onCompleteAction, isComplete]);

  const callback = useCallback((): void => {
    try {
      inputEl.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [inputEl]);

  return { callback };
};

export const useUploadFiles: EnsembleActionHook<UploadFilesAction> = (
  action?: UploadFilesAction,
) => {
  const [body, setBody] = useState<Record<string, unknown>>();
  const [headers, setHeaders] = useState<Record<string, unknown>>();
  const [status, setStatus] = useState<UploadStatus>("pending");
  const [progress, setProgress] = useState<number>(0.0);

  const onCompleteAction = useEnsembleAction(action?.onComplete);
  const onErrorAction = useEnsembleAction(action?.onError);
  const screenContext = useScreenContext();

  useRegisterBindings(
    {
      body,
      headers,
      status,
      progress,
    },
    action?.id,
    {
      setBody,
      setHeaders,
      setStatus,
      setProgress,
    },
  );

  const callback = useCallback(async (): Promise<void> => {
    const apiModel = screenContext?.model?.apis?.find(
      (model) => model.name === action?.uploadApi,
    );
    if (!apiModel) return;

    const progressCallback = (progressEvent: ProgressEvent): void => {
      const percentCompleted =
        (progressEvent.loaded * 100) / progressEvent.total;

      setProgress(percentCompleted);
    };

    const files = evaluate<FileList>(
      screenContext as ScreenContextDefinition,
      action?.files,
    );
    if (!files || files.length === 0) throw Error("Files not found");

    const formData = new FormData();
    if (files.length === 1)
      formData.append(action?.fieldName ?? "files", files[0]);
    else
      for (let i = 0; i < files.length; i++) {
        formData.append(action?.fieldName ?? `file${i}`, files[i]);
      }

    if (isObject(apiModel.body)) {
      const apiModelBody = apiModel.body as Record<string, unknown>;
      for (const key in apiModelBody) {
        const evaluatedValue = isExpression(apiModelBody[key])
          ? evaluate(
              screenContext as ScreenContextDefinition,
              apiModelBody[key] as string,
              action?.inputs,
            )
          : apiModelBody[key];
        formData.append(key, evaluatedValue as string);
      }
    }

    const apiUrl = evaluate<string>(
      screenContext as ScreenContextDefinition,
      `\`${apiModel.uri}\``,
      action?.inputs,
    );

    try {
      setStatus("running");
      const response = await DataFetcher.uploadFiles(
        apiUrl,
        apiModel.method,
        {
          "Content-Type": "multipart/form-data",
          ...apiModel.headers,
        },
        formData,
        progressCallback,
      );

      setBody(response.body as Record<string, unknown>);
      setHeaders(response.headers as Record<string, unknown>);
      if (response.isSuccess) {
        setStatus("completed");
        onCompleteAction?.callback({ response });
      } else {
        setStatus("failed");
        onErrorAction?.callback({ response });
      }
    } catch (error: unknown) {
      setBody(error as Record<string, unknown>);
      setStatus("failed");
      onErrorAction?.callback({ error });
    }
  }, [
    screenContext,
    action?.files,
    action?.fieldName,
    action?.inputs,
    action?.uploadApi,
    onCompleteAction,
    onErrorAction,
  ]);

  return { callback };
};

/* eslint-disable react-hooks/rules-of-hooks */
export const useEnsembleAction = (
  action?: EnsembleAction,
  options?: unknown,
): EnsembleActionHookResult => {
  // FIXME: Figure out how to chain without breaking rules of hooks and infinite loop
  if (!action) {
    return;
  }
  if (action.invokeApi) {
    return useInvokeApi(action.invokeApi, options);
  }

  if (action.executeCode) {
    return useExecuteCode(
      action.executeCode,
      options as UseExecuteCodeActionOptions,
    );
  }
  if (action.navigateScreen) {
    return useNavigateScreen(action.navigateScreen, options);
  }

  if (action.navigateUrl) {
    return useNavigateUrl(action.navigateUrl, options);
  }

  if (action.navigateModalScreen) {
    return useNavigateModalScreen(action.navigateModalScreen, options);
  }

  if (action.showToast) {
    return useShowToast(action.showToast);
  }
  if (action.showDialog) {
    return useShowDialog(action.showDialog);
  }

  if ("closeAllDialogs" in action) {
    return useCloseAllDialogs();
  }

  if (action.pickFiles) {
    return usePickFiles(action.pickFiles);
  }
  if (action.uploadFiles) {
    return useUploadFiles(action.uploadFiles);
  }
};
/* eslint-enable react-hooks/rules-of-hooks */
