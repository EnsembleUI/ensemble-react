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
  useCustomEventScope,
  CustomScopeProvider,
  CustomThemeContext,
  useLanguageScope,
  useDeviceData,
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
  ExecuteActionGroupAction,
  ConnectSocketAction,
  DisconnectSocketAction,
  SendSocketMessageAction,
  EnsembleActionHookResult,
  DispatchEventAction,
  ExecuteConditionalActionAction,
  NavigateModalScreenAction,
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
  keys,
  last,
  toNumber,
} from "lodash-es";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line import/no-cycle
import {
  navigateApi,
  navigateUrl,
  navigateExternalScreen,
  navigateModalScreen,
} from "../navigation";
import { locationApi } from "../locationApi";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
import { getShowDialogOptions, showDialog } from "../showDialog";
import { invokeAPI } from "../invokeApi";
import {
  handleConnectSocket,
  handleMessageSocket,
  handleDisconnectSocket,
} from "../websocket";
import {
  extractCondition,
  hasProperStructure,
} from "../../widgets/Conditional";
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useNavigateScreen } from "./useNavigateScreen";
import { useShowToast } from "./useShowToast";
import { useCloseAllDialogs } from "./useCloseAllDialogs";
import { useNavigateUrl } from "./useNavigateUrl";
import { useNavigateExternalScreen } from "./useNavigateExternalScreen";

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

interface SetLocaleProps {
  languageCode: string;
}

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
  const modalContext = useContext(ModalContext);
  const themescope = useContext(CustomThemeContext);
  const user = useEnsembleUser();
  const appContext = useApplicationContext();
  const screenData = useScreenData();
  const { i18n } = useLanguageScope();
  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete,
  );
  const theme = appContext?.application?.theme;
  const device = useDeviceData();

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
              device: device,
              ensemble: {
                ...themescope,
                storage,
                user,
                formatter,
                env: appContext?.env,
                secrets: appContext?.secrets,
                navigateScreen: (targetScreen: NavigateScreenAction): void =>
                  navigateApi(targetScreen, screen, navigate),
                navigateModalScreen: (
                  navigateModalScreenAction: NavigateModalScreenAction,
                ): void => {
                  if (!modalContext) {
                    return;
                  }
                  navigateModalScreen(
                    navigateModalScreenAction,
                    screen,
                    modalContext,
                  );
                },
                location: locationApi(location),
                navigateUrl: (
                  url: string,
                  inputs?: { [key: string]: unknown },
                ) => navigateUrl(url, navigate, inputs),
                showDialog: (dialogAction?: ShowDialogAction): void =>
                  showDialog({
                    action: dialogAction,
                    openModal: modalContext?.openModal,
                  }),
                closeAllDialogs: (): void => modalContext?.closeAllModals(),
                invokeAPI: async (
                  apiName: string,
                  apiInputs?: { [key: string]: unknown },
                ) =>
                  invokeAPI(screenData, apiName, apiInputs, {
                    ...customScope,
                    ensemble: {
                      env: appContext?.env,
                      secrets: appContext?.secrets,
                    },
                  }),
                navigateBack: (): void =>
                  modalContext ? modalContext.navigateBack() : navigate(-1),
                navigateExternalScreen: (url: NavigateExternalScreen) =>
                  navigateExternalScreen(url),
                openUrl: (url: NavigateExternalScreen) =>
                  navigateExternalScreen(url),
                connectSocket: (name: string) =>
                  handleConnectSocket(screenData, name),
                messageSocket: (
                  name: string,
                  message: { [key: string]: unknown },
                ) => handleMessageSocket(screenData, name, message),
                disconnectSocket: (name: string) =>
                  handleDisconnectSocket(screenData, name),
                setLocale: ({ languageCode }: SetLocaleProps) =>
                  i18n.changeLanguage(languageCode),
              },
            },
            mapKeys(theme?.Tokens ?? {}, (_, key) => key.toLowerCase()),
            { styles: theme?.Styles },
            customScope,
            options?.context,
            args,
          ) as { [key: string]: unknown },
        );
        onCompleteAction?.callback({
          ...(args as { [key: string]: unknown }),
          result: retVal,
        });
        return retVal;
      } catch (e) {
        logError(e);
      }
    };
  }, [
    screen,
    js,
    appContext?.application?.customWidgets,
    appContext?.env,
    appContext?.secrets,
    themescope,
    device,
    storage,
    user,
    formatter,
    location,
    theme?.Tokens,
    theme?.Styles,
    customScope,
    options?.context,
    onCompleteAction,
    navigate,
    modalContext,
    screenData,
  ]);

  return execute ? { callback: execute } : undefined;
};

export const useInvokeAPI: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const { apis, setData } = useScreenData();
  const appContext = useApplicationContext();
  const [isComplete, setIsComplete] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();
  const evaluatedInputs = useEvaluate(action?.inputs, { context });
  const evaluatedName = useEvaluate({ name: action?.name }, { context });

  const api = useMemo(
    () => apis?.find((model) => model.name === evaluatedName.name),
    [evaluatedName.name, apis],
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

      if (action?.id) {
        setData(action.id, {
          isLoading: true,
          isSuccess: false,
          isError: false,
        });
      }

      setIsComplete(false);
      setContext(args as { [key: string]: unknown });
    };
    return { callback };
  }, [api, setData, action]);

  useEffect(() => {
    if (!api || isComplete !== false || isLoading) {
      return;
    }

    const fireRequest = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await DataFetcher.fetch(api, {
          ...evaluatedInputs,
          ...context,
          ensemble: {
            env: appContext?.env,
            secrets: appContext?.secrets,
          },
        });
        setData(api.name, res);

        if (action?.id) {
          setData(action.id, res);
        }

        onAPIResponseAction?.callback({ ...context, response: res });
        onInvokeAPIResponseAction?.callback({ ...context, response: res });
      } catch (e) {
        logError(e);

        setData(api.name, {
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        if (action?.id) {
          setData(action.id, {
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }

        onAPIErrorAction?.callback({ ...context, error: e });
        onInvokeAPIErrorAction?.callback({ ...context, error: e });
      } finally {
        setIsComplete(true);
        setIsLoading(false);
      }
    };

    void fireRequest();
  }, [
    api,
    action,
    evaluatedInputs,
    isComplete,
    isLoading,
    onInvokeAPIErrorAction,
    onInvokeAPIResponseAction,
    onAPIErrorAction,
    onAPIResponseAction,
    setData,
    context,
    appContext?.env,
    appContext?.secrets,
  ]);

  return invokeApi;
};

export const useConnectSocket: EnsembleActionHook<ConnectSocketAction> = (
  action,
) => {
  const screenData = useScreenData();

  const socket = useMemo(
    () => screenData.sockets?.find((model) => model.name === action?.name),
    [action, screenData],
  );

  const onSocketConnectAction = useEnsembleAction(socket?.onSuccess);
  const onMessageReceiveAction = useEnsembleAction(socket?.onReceive);
  const onSocketDisconnectAction = useEnsembleAction(socket?.onDisconnect);

  const connectSocket = useMemo(() => {
    if (!socket) {
      return;
    }

    const callback = (): void => {
      handleConnectSocket(
        screenData,
        socket.name,
        onSocketConnectAction,
        onMessageReceiveAction,
        onSocketDisconnectAction,
      );
    };
    return { callback };
  }, [
    screenData,
    socket,
    onSocketConnectAction,
    onMessageReceiveAction,
    onSocketDisconnectAction,
  ]);

  return connectSocket;
};

export const useMessageSocket: EnsembleActionHook<SendSocketMessageAction> = (
  action,
) => {
  const screenData = useScreenData();
  const [isComplete, setIsComplete] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();
  const evaluatedInputs = useEvaluate(action?.message, { context });

  const sendSocketMessage = useMemo(() => {
    const callback = (args: unknown): void => {
      setIsComplete(false);
      setContext(args as { [key: string]: unknown });
    };
    return { callback };
  }, []);

  useEffect(() => {
    if (!action || isComplete !== false) {
      return;
    }

    // send socket message
    handleMessageSocket(screenData, action.name, evaluatedInputs);
    setIsComplete(true);
  }, [screenData, action, evaluatedInputs, isComplete]);

  return sendSocketMessage;
};

export const useDisconnectSocket: EnsembleActionHook<DisconnectSocketAction> = (
  action,
) => {
  const screenData = useScreenData();

  const disconnectSocket = useMemo(() => {
    const callback = (): void => {
      if (action?.name) {
        handleDisconnectSocket(screenData, action.name);
      }
    };
    return { callback };
  }, [screenData, action]);

  return disconnectSocket;
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
  const [files, setFiles] = useState<File[]>();
  const [isComplete, setIsComplete] = useState<boolean>();
  const onCompleteAction = useEnsembleAction(action?.onComplete);
  const onErrorAction = useEnsembleAction(action?.onError);

  const { values } = useRegisterBindings(
    {
      files,
      ...action,
    },
    action?.id,
    {
      setFiles,
    },
    {
      // need to override default comparator with isEqual for File object
      comparator: isEqual,
    },
  );

  const inputEl = useMemo(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = values?.allowMultiple || false;
    input.accept =
      values?.allowedExtensions?.map((ext) => ".".concat(ext))?.toString() ||
      "*/*";

    return input;
  }, [values?.allowMultiple, values?.allowedExtensions]);

  useEffect(() => {
    inputEl.onchange = (event: Event): void => {
      const selectedFiles =
        (event.target as HTMLInputElement).files || undefined;

      if (selectedFiles && !isEqual(selectedFiles, files)) {
        setIsComplete(false);
        setFiles(Array.from(selectedFiles));
      }
    };
    return () => {
      inputEl.remove();
    };
  }, [inputEl, files]);

  useEffect(() => {
    // Ensure widget state is up to date with component state
    if (isEmpty(values?.files) || !isEqual(values?.files, files)) {
      return;
    }

    if (isComplete === false) {
      setIsComplete(true);
      if (
        !isEmpty(values?.allowedExtensions) &&
        !values?.files?.every((file) =>
          values.allowedExtensions?.some((ext) => file.name.endsWith(ext)),
        )
      ) {
        onErrorAction?.callback({
          files: values?.files,
          error: "EXTENSION_NOT_ALLOWED",
        });
      } else if (
        Boolean(values?.allowMaxFileSizeBytes) &&
        !values?.files?.every((file) => {
          return file.size < values.allowMaxFileSizeBytes!;
        })
      ) {
        onErrorAction?.callback({
          files: values?.files,
          error: "MAX_FILE_SIZE_EXCEEDED",
        });
      } else {
        onCompleteAction?.callback({ files: values?.files });
      }
    }
  }, [onCompleteAction, isComplete, files, values, onErrorAction]);

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

  const callback = useCallback(
    async (args: unknown): Promise<void> => {
      if (!apiModel || !action) return;

      const argContext = args as { [key: string]: unknown };
      const files = evaluate<FileList>(
        screenContext as ScreenContextDefinition,
        action.files,
        argContext,
      );
      if (isEmpty(files)) throw Error("Files not found");

      try {
        setStatus("running");
        const response = await DataFetcher.uploadFiles(
          apiModel,
          action,
          files,
          progressCallback,
          { ...evaluatedInputs, ...argContext },
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
    },
    [
      apiModel,
      action,
      screenContext,
      progressCallback,
      evaluatedInputs,
      onCompleteAction,
      onErrorAction,
    ],
  );

  return { callback };
};

export const useNavigateBack: EnsembleActionHook<NavigateBackAction> = () => {
  const modalContext = useContext(ModalContext);

  const callback = useCallback(() => {
    modalContext?.navigateBack();
  }, []);

  return { callback };
};

export const useActionGroup: EnsembleActionHook<ExecuteActionGroupAction> = (
  action,
) => {
  // This ensures hooks are fired in consistent order
  const actions = useMemo(() => action?.actions ?? [], [action]);

  const execActs = actions.map((act: EnsembleAction) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useEnsembleAction(act);
  });

  const callback = (args: unknown): void => {
    execActs.forEach((act) => act?.callback(args));
  };

  return { callback };
};

export const useDispatchEvent: EnsembleActionHook<DispatchEventAction> = (
  action,
) => {
  const eventName = keys(action)[0];
  const [isComplete, setIsComplete] = useState<boolean>();
  const [context, setContext] = useState<unknown>();
  const eventData = (action ? action[eventName] : {}) as {
    [key: string]: unknown;
  };
  const eventScope = useCustomEventScope();

  const evaluatedInputs = useEvaluate(eventData, { context });

  const events = get(eventScope, eventName) as {
    [key: string]: unknown;
  };

  // Use a separate hook call for each event action
  const ensembleActions = Object.keys(events || {}).map((customAction) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEnsembleAction({ [customAction]: events[customAction] }),
  );

  const callback = useCallback((args: unknown): void => {
    setContext(args);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (isComplete !== false) {
      return;
    }

    ensembleActions.forEach((act) =>
      act?.callback({
        ...evaluatedInputs,
        ...(context as { [key: string]: unknown }),
      }),
    );

    setIsComplete(true);
  }, [ensembleActions, evaluatedInputs, isComplete]);

  return { callback };
};

export const useConditionalAction: EnsembleActionHook<
  ExecuteConditionalActionAction
> = (action) => {
  if (!action?.conditions) {
    throw new Error("No conditions provided for executeConditionalAction");
  }

  const [isValid, errorMessage] = hasProperStructure(action.conditions);
  if (!isValid) {
    throw Error(errorMessage);
  }

  const conditionStatements = action.conditions.map(extractCondition);
  const execActs = action.conditions.map((condition) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useEnsembleAction(condition.action);
  });
  const [isComplete, setIsComplete] = useState<boolean>();
  const [context, setContext] = useState<unknown>();
  const [trueActionIndex, setTrueActionIndex] = useState<number>();
  const evaluatedStatements = useEvaluate(
    conditionStatements as unknown as { [key: string]: unknown },
    {
      context,
    },
  );

  useEffect(() => {
    if (trueActionIndex === undefined) {
      return;
    }

    execActs[trueActionIndex]?.callback(context);
    setTrueActionIndex(undefined);
  }, [context, execActs, trueActionIndex]);

  useEffect(() => {
    if (!action || isComplete !== false) {
      return;
    }

    const index = Object.keys(evaluatedStatements).find(
      (key) => evaluatedStatements[key] === true,
    );

    let trueIndex: number | undefined;
    if (index !== undefined) {
      trueIndex = toNumber(index);
    }

    if (trueIndex === undefined || trueIndex < 0) {
      // check if last condition is 'else'
      const lastCondition = last(action.conditions);
      if (lastCondition && "else" in lastCondition) {
        trueIndex = action.conditions.length - 1;
      }
      // if no condition is true, return
      else {
        setIsComplete(true);
        return;
      }
    }

    setTrueActionIndex(trueIndex);
    setIsComplete(true);
  }, [action, evaluatedStatements, isComplete, context]);

  const callback = (args: unknown): void => {
    setContext(args);
    setIsComplete(false);
  };

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

  if ("openUrl" in action) {
    return useNavigateExternalScreen(action.openUrl);
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

  if ("executeActionGroup" in action) {
    return useActionGroup(action.executeActionGroup);
  }

  if ("connectSocket" in action) {
    return useConnectSocket(action.connectSocket);
  }

  if ("messageSocket" in action) {
    return useMessageSocket(action.messageSocket);
  }

  if ("disconnectSocket" in action) {
    return useDisconnectSocket(action.disconnectSocket);
  }

  if ("dispatchEvent" in action) {
    return useDispatchEvent(action.dispatchEvent);
  }

  if ("executeConditionalAction" in action) {
    return useConditionalAction(action.executeConditionalAction);
  }
};
/* eslint-enable react-hooks/rules-of-hooks */
