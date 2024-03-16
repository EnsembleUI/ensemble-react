import {
  DataFetcher,
  useScreenContext,
  evaluate,
  useRegisterBindings,
  error as logError,
  useScreenData,
  useEnsembleStorage,
  DateFormatter,
  useApplicationContext,
  unwrapWidget,
  useEnsembleUser,
  useEvaluate,
  useCustomScope,
  CustomScopeProvider,
  CustomThemeContext,
} from "@ensembleui/react-framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  EnsembleAction,
  PickFilesAction,
  UploadFilesAction,
  ScreenContextDefinition,
  ShowDialogAction,
  NavigateScreenAction,
  CustomScope,
  NavigateBackAction,
  NavigateExternalScreen,
} from "@ensembleui/react-framework";
import {
  isEmpty,
  isString,
  merge,
  isObject,
  get,
  set,
  mapKeys,
  cloneDeep,
  isEqual,
} from "lodash-es";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  navigateApi,
  navigateBack,
  navigateUrl,
  navigateExternalScreen,
} from "../navigation";
import { locationApi } from "../locationApi";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
import { getShowDialogOptions, showDialog } from "../showDialog";
import { invokeAPI } from "../invokeApi";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useNavigateScreen } from "./useNavigateScreen";
import { useShowToast } from "./useShowToast";
import { useCloseAllDialogs } from "./useCloseAllDialogs";
import { useNavigateUrl } from "./useNavigateUrl";
import { useNavigateExternalScreen } from "./useNavigteExternalScreen";

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
  context?: { [key: string]: unknown };
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
  const customScope = useCustomScope();
  const { openModal, closeAllModals } = useContext(ModalContext) || {};
  const themescope = useContext(CustomThemeContext);
  const user = useEnsembleUser();
  const appContext = useApplicationContext();
  const screenData = useScreenData();
  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete,
  );
  const theme = appContext?.application?.theme;

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

  const execute = useMemo(() => {
    if (!screen || !js) {
      return;
    }

    const customWidgets = appContext?.application?.customWidgets.reduce(
      (acc, widget) => ({ ...acc, [widget.name]: widget }),
      {},
    );

    return (args: unknown) => {
      try {
        const retVal = evaluate(
          screen,
          js,
          merge(
            {
              ...customWidgets,
              ensemble: {
                ...themescope,
                storage,
                user,
                formatter,
                env: appContext?.env,
                navigateScreen: (targetScreen: NavigateScreenAction): void =>
                  navigateApi(targetScreen, screen, navigate),
                location: locationApi(location),
                navigateUrl: (
                  url: string,
                  inputs?: { [key: string]: unknown },
                ) => navigateUrl(url, navigate, inputs),
                showDialog: (dialogAction?: ShowDialogAction): void =>
                  showDialog({ action: dialogAction, openModal }),
                closeAllDialogs: (): void => closeAllModals?.(),
                invokeAPI: async (
                  apiName: string,
                  apiInputs?: { [key: string]: unknown },
                ) => {
                  const apiRes = await invokeAPI(
                    screen,
                    screenData,
                    apiName,
                    apiInputs,
                    customScope,
                  );
                  return apiRes;
                },
                navigateBack: (): void => navigateBack(navigate),
                navigateExternalScreen: (url: NavigateExternalScreen) =>
                  navigateExternalScreen(url),
              },
            },
            mapKeys(theme?.Tokens ?? {}, (_, key) => key.toLowerCase()),
            { styles: theme?.Styles },
            customScope,
            options?.context,
            args,
          ) as { [key: string]: unknown },
        );
        onCompleteAction?.callback();
        return retVal;
      } catch (e) {
        logError(e);
      }
    };
  }, [
    themescope,
    screen,
    js,
    storage,
    user,
    formatter,
    appContext?.env,
    location,
    theme?.Tokens,
    theme?.Styles,
    customScope,
    options?.context,
    onCompleteAction,
    navigate,
  ]);

  return execute ? { callback: execute } : undefined;
};

export const useInvokeAPI: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const { apis, setData } = useScreenData();
  const [isComplete, setIsComplete] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [context, setContext] = useState<unknown>();
  const evaluatedInputs = useEvaluate(action?.inputs, { context });

  const api = useMemo(
    () => apis?.find((model) => model.name === action?.name),
    [action?.name, apis],
  );

  const onInvokeAPIResponseAction = useEnsembleAction(action?.onResponse);
  const onInvokeAPIErrorAction = useEnsembleAction(action?.onError);

  const onAPIResponseAction = useEnsembleAction(api?.onResponse);
  const onAPIErrorAction = useEnsembleAction(api?.onError);

  const invokeApi = useMemo(() => {
    if (!api) {
      return;
    }

    const callback = (args: unknown): void => {
      // We greedily set data loading state in screen context to update bindings
      setData(api.name, {
        isLoading: true,
        isSuccess: false,
        isError: false,
      });
      setIsComplete(false);
      setContext(args);
    };
    return { callback };
  }, [api, setData]);

  useEffect(() => {
    if (!api || isComplete !== false || isLoading) {
      return;
    }

    const fireRequest = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await DataFetcher.fetch(api, evaluatedInputs);
        setData(api.name, res);
        onAPIResponseAction?.callback({ response: res });
        onInvokeAPIResponseAction?.callback({ response: res });
      } catch (e) {
        logError(e);
        onAPIErrorAction?.callback({ error: e });
        onInvokeAPIErrorAction?.callback({ error: e });
      } finally {
        setIsLoading(false);
        setIsComplete(true);
      }
    };

    void fireRequest();
  }, [
    api,
    evaluatedInputs,
    isComplete,
    isLoading,
    onInvokeAPIErrorAction,
    onInvokeAPIResponseAction,
    onAPIErrorAction,
    onAPIResponseAction,
    setData,
  ]);

  return invokeApi;
};

export const useShowDialog: EnsembleActionHook<ShowDialogAction> = (
  action?: ShowDialogAction,
) => {
  const { openModal } = useContext(ModalContext) || {};
  const ensembleAction = useEnsembleAction(action?.onDialogDismiss);
  const customScope = useCustomScope();

  const onDismissCallback = useCallback(() => {
    if (!ensembleAction) {
      return;
    }
    ensembleAction.callback();
  }, [ensembleAction]);

  if (!action?.widget && !action?.body)
    throw new Error("ShowDialog Action requires a widget to be specified");
  const widget = useMemo(
    () => unwrapWidget(cloneDeep(action.widget || action.body || {})),
    [action.widget, action.body],
  );
  const callback = useCallback(
    (args: unknown) => {
      const modalOptions = getShowDialogOptions(
        action.options,
        onDismissCallback,
      );
      const widgetBackgroundColor = get(
        widget,
        "properties.styles.backgroundColor", // FIXME: works only for inline widget
      );
      if (isString(widgetBackgroundColor)) {
        set(modalOptions, "backgroundColor", widgetBackgroundColor);
      }

      openModal?.(
        <CustomScopeProvider
          value={merge(
            {},
            customScope,
            isObject(args) ? (args as CustomScope) : undefined,
          )}
        >
          {EnsembleRuntime.render([widget])}
        </CustomScopeProvider>,
        modalOptions,
        true,
        merge(
          {},
          customScope,
          isObject(args) ? (args as CustomScope) : undefined,
        ),
      );
    },
    [widget, onDismissCallback, action.options, openModal, customScope],
  );

  return { callback };
};

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const [files, setFiles] = useState<FileList>();
  const [isComplete, setIsComplete] = useState<boolean>();
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

    return input;
  }, [action?.allowMultiple, action?.allowedExtensions]);

  useEffect(() => {
    inputEl.onchange = (event: Event): void => {
      const selectedFiles =
        (event.target as HTMLInputElement).files || undefined;

      if (!isEqual(selectedFiles, files)) {
        setIsComplete(false);
        setFiles(selectedFiles);
      }
    };
    return () => {
      inputEl.remove();
    };
  }, [inputEl, files]);

  useEffect(() => {
    if (!isEmpty(values?.files) && isComplete === false) {
      onCompleteAction?.callback({ files: values?.files });
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
  const [body, setBody] = useState<{ [key: string]: unknown }>();
  const [headers, setHeaders] = useState<{ [key: string]: unknown }>();
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

  const apiModel = useMemo(
    () =>
      screenContext?.model?.apis?.find(
        (model) => model.name === action?.uploadApi,
      ),
    [action?.uploadApi, screenContext?.model?.apis],
  );

  const progressCallback = useCallback((progressEvent: ProgressEvent): void => {
    const percentCompleted = (progressEvent.loaded * 100) / progressEvent.total;

    setProgress(percentCompleted);
  }, []);

  const evaluatedInputs = useEvaluate(action?.inputs);

  const callback = useCallback(async (): Promise<void> => {
    if (!apiModel || !action) return;

    const files = evaluate<FileList>(
      screenContext as ScreenContextDefinition,
      action.files,
    );
    if (isEmpty(files)) throw Error("Files not found");

    try {
      setStatus("running");
      const response = await DataFetcher.uploadFiles(
        apiModel,
        action,
        files,
        progressCallback,
        evaluatedInputs,
      );

      setBody(response.body as { [key: string]: unknown });
      setHeaders(response.headers as { [key: string]: unknown });
      if (response.isSuccess) {
        setStatus("completed");
        onCompleteAction?.callback({ response });
      } else {
        setStatus("failed");
        onErrorAction?.callback({ response });
      }
    } catch (error: unknown) {
      setBody(error as { [key: string]: unknown });
      setStatus("failed");
      onErrorAction?.callback({ error });
    }
  }, [
    apiModel,
    action,
    screenContext,
    progressCallback,
    evaluatedInputs,
    onCompleteAction,
    onErrorAction,
  ]);

  return { callback };
};

export const useNavigateBack: EnsembleActionHook<NavigateBackAction> = () => {
  const navigate = useNavigate();

  const callback = useCallback(() => {
    navigateBack(navigate);
  }, [navigateBack, navigate]);

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
  if ("invokeAPI" in action) {
    return useInvokeAPI(action.invokeAPI, options);
  }

  // TODO: deprecated - remove usage of "invokeApi"
  if ("invokeApi" in action) {
    return useInvokeAPI(action.invokeApi, options);
  }

  if ("executeCode" in action) {
    return useExecuteCode(
      action.executeCode,
      options as UseExecuteCodeActionOptions,
    );
  }
  if ("navigateScreen" in action) {
    return useNavigateScreen(action.navigateScreen, options);
  }

  if ("navigateUrl" in action) {
    return useNavigateUrl(action.navigateUrl, options);
  }

  if ("navigateModalScreen" in action) {
    return useNavigateModalScreen(action.navigateModalScreen, options);
  }

  if ("navigateBack" in action) {
    return useNavigateBack(action.navigateBack);
  }

  if ("navigateExternalScreen" in action) {
    return useNavigateExternalScreen(action.navigateExternalScreen);
  }

  if ("showToast" in action) {
    return useShowToast(action.showToast);
  }
  if ("showDialog" in action) {
    return useShowDialog(action.showDialog);
  }

  if ("closeAllDialogs" in action) {
    return useCloseAllDialogs();
  }

  if ("pickFiles" in action) {
    return usePickFiles(action.pickFiles);
  }
  if ("uploadFiles" in action) {
    return useUploadFiles(action.uploadFiles);
  }
};
/* eslint-enable react-hooks/rules-of-hooks */
