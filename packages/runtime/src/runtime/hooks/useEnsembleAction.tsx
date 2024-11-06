import {
  DataFetcher,
  useScreenContext,
  evaluate,
  useRegisterBindings,
  error as logError,
  useScreenData,
  useApplicationContext,
  unwrapWidget,
  useEvaluate,
  useCustomScope,
  useCustomEventScope,
  CustomScopeProvider,
  isUsingMockResponse,
  mockResponse,
  useCommandCallback,
  useScreenModel,
} from "@ensembleui/react-framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  EnsembleAction,
  PickFilesAction,
  UploadFilesAction,
  ScreenContextDefinition,
  ShowDialogAction,
  CustomScope,
  NavigateBackAction,
  ExecuteActionGroupAction,
  ConnectSocketAction,
  DisconnectSocketAction,
  SendSocketMessageAction,
  EnsembleActionHookResult,
  DispatchEventAction,
  ExecuteConditionalActionAction,
} from "@ensembleui/react-framework";
import {
  isEmpty,
  isString,
  merge,
  isObject,
  has,
  get,
  set,
  cloneDeep,
  isEqual,
  keys,
  last,
  toNumber,
} from "lodash-es";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
import { getShowDialogOptions } from "../showDialog";
import { locationApi } from "../locationApi";
import {
  handleConnectSocket,
  handleMessageSocket,
  handleDisconnectSocket,
} from "../websocket";
import {
  extractCondition,
  hasProperStructure,
} from "../../widgets/Conditional";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useNavigateScreen } from "./useNavigateScreen";
import { useShowToast } from "./useShowToast";
import { useCloseAllDialogs } from "./useCloseAllDialogs";
import { useNavigateUrl } from "./useNavigateUrl";
import { useNavigateExternalScreen } from "./useNavigateExternalScreen";
import { useCloseAllScreens } from "./useCloseAllModalScreens";

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
  const screenModel = useScreenModel();
  const modalContext = useContext(ModalContext);
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = useApplicationContext();
  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete,
  );

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
      return appContext?.application?.scripts.find(
        (script) => script.name === action.scriptName,
      )?.body;
    }
  }, [action, isCodeString, appContext?.application?.scripts]);

  const execute = useCommandCallback(
    (evalContext, ...args: unknown[]) => {
      if (!js) {
        return;
      }
      const context = merge({}, evalContext, ...args, options?.context) as {
        [key: string]: unknown;
      };
      const retVal = evaluate({ model: screenModel }, js, context);
      onCompleteAction?.callback({
        ...(args[0] as { [key: string]: unknown }),
        result: retVal,
      });
      return retVal;
    },
    { navigate, location: locationApi(location) },
    [js, onCompleteAction, screenModel],
    { modalContext, render: EnsembleRuntime.render, EnsembleScreen },
  );

  return { callback: execute };
};

export const useInvokeAPI: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const { apis, setData, mockResponses } = useScreenData();
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
      const useMockResponse =
        has(api, "mockResponse") &&
        isUsingMockResponse(appContext?.application?.id);
      setIsLoading(true);
      try {
        const res = await DataFetcher.fetch(
          api,
          {
            ...evaluatedInputs,
            ...context,
            ensemble: {
              env: appContext?.env,
              secrets: appContext?.secrets,
            },
          },
          {
            mockResponse: mockResponse(
              mockResponses[api.name],
              useMockResponse,
            ),
            useMockResponse,
          },
        );
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

  const callback = useCallback(() => {
    if (!socket) {
      return;
    }

    handleConnectSocket(
      screenData,
      socket.name,
      onSocketConnectAction,
      onMessageReceiveAction,
      onSocketDisconnectAction,
    );
  }, [
    socket,
    onSocketConnectAction,
    onMessageReceiveAction,
    onSocketDisconnectAction,
  ]);

  return useMemo(() => ({ callback }), [callback]);
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
  }, [action]);

  return useMemo(() => disconnectSocket, [disconnectSocket]);
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

  return useMemo(() => ({ callback }), [callback]);
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
  );

  const handleSelectedFilesCallback = useCallback(
    (event: Event): void => {
      const selectedFiles =
        (event.target as HTMLInputElement).files || undefined;

      if (selectedFiles && !isEqual(selectedFiles, files)) {
        setIsComplete(false);
        setFiles(Array.from(selectedFiles));
      }
    },
    [files],
  );

  const inputEl = useMemo(() => {
    const input = document.createElement("input");
    if (values?.id) {
      input.id = values.id;
    }
    input.hidden = true;
    input.type = "file";
    input.multiple = values?.allowMultiple || false;
    input.accept =
      values?.allowedExtensions?.map((ext) => ".".concat(ext))?.toString() ||
      "*/*";
    input.onchange = handleSelectedFilesCallback;

    return input;
  }, [
    values?.allowMultiple,
    values?.allowedExtensions,
    values?.id,
    handleSelectedFilesCallback,
  ]);

  useEffect(() => {
    document.body.append(inputEl);

    return () => {
      inputEl.remove();
    };
  }, [inputEl]);

  useEffect(() => {
    // Ensure widget state is up to date with component state
    if (isEmpty(values?.files) || !isEqual(values?.files, files)) {
      return;
    }

    if (isComplete === false) {
      setIsComplete(true);

      // if file extension is not allowed
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
        // if file size is out of allow max size
      } else if (
        values?.allowMaxFileSizeBytes &&
        values.files?.some(
          (file) => file.size >= (values.allowMaxFileSizeBytes || 0),
        )
      ) {
        onErrorAction?.callback({
          files: values.files,
          error: "MAX_FILE_SIZE_EXCEEDED",
        });
        // successfull file handle
      } else {
        onCompleteAction?.callback({ files: values?.files });
      }
    }
  }, [
    values?.files,
    values?.allowedExtensions,
    values?.allowMaxFileSizeBytes,
    files,
    isComplete,
    onErrorAction,
    onCompleteAction,
  ]);

  const callback = useCallback((): void => {
    try {
      inputEl.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
    }
  }, []);

  return useMemo(() => ({ callback }), [callback]);
};

export const useUploadFiles: EnsembleActionHook<UploadFilesAction> = (
  action?: UploadFilesAction,
) => {
  const [body, setBody] = useState<{ [key: string]: unknown }>();
  const [headers, setHeaders] = useState<{ [key: string]: unknown }>();
  const [status, setStatus] = useState<UploadStatus>("pending");
  const [progress, setProgress] = useState<number>(0.0);
  const screenContext = useScreenContext();

  const onCompleteAction = useEnsembleAction(action?.onComplete);
  const onErrorAction = useEnsembleAction(action?.onError);

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

  const callback = useCallback(
    async (args: unknown) => {
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
      } catch (error) {
        setBody(error as { [key: string]: unknown });
        setStatus("failed");
        onErrorAction?.callback({ error });
      }
    },
    [
      apiModel,
      action,
      screenContext,
      onCompleteAction,
      onErrorAction,
      progressCallback,
    ],
  );
  return useMemo(() => ({ callback }), [callback]);
};

export const useNavigateBack: EnsembleActionHook<NavigateBackAction> = () => {
  const modalContext = useContext(ModalContext);

  const callback = useCallback(() => {
    modalContext?.navigateBack();
  }, []);

  return useMemo(() => ({ callback }), [callback]);
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

  const triggerCallbacks = useCallback(
    (args: unknown) => {
      execActs.forEach((act) => act?.callback(args));
    },
    [execActs],
  );

  const callback = useCallback((args: unknown): void => {
    triggerCallbacks(args);
  }, []);

  return useMemo(() => ({ callback }), [callback]);
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

  if (isString(action)) {
    return useExecuteCode(action);
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

  if ("closeAllScreens" in action) {
    return useCloseAllScreens();
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
