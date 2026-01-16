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
  generateAPIHash,
  evaluateDeep,
} from "@ensembleui/react-framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  EnsembleAction,
  PickFilesAction,
  UploadFilesAction,
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
  noop,
} from "lodash-es";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
    async (evalContext, ...args: unknown[]) => {
      if (!js) {
        return;
      }
      const context = merge({}, evalContext, ...args, options?.context) as {
        [key: string]: unknown;
      };

      const retVal = await evaluate({ model: screenModel }, js, context);

      onCompleteAction?.callback({
        ...(args[0] as { [key: string]: unknown }),
        result: retVal,
      });
      return retVal;
    },
    { navigate, location: locationApi(location) },
    [js, onCompleteAction?.callback, screenModel],
    {
      modalContext,
      render: EnsembleRuntime.render,
      EnsembleScreen,
      toaster: toast as (...args: unknown[]) => void,
    },
  );

  return { callback: execute };
};

export const useInvokeAPI: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const { apis, setData, mockResponses } = useScreenData();
  const appContext = useApplicationContext();
  const screenModel = useScreenModel();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onInvokeAPIResponseAction = useEnsembleAction(action?.onResponse);
  const onInvokeAPIErrorAction = useEnsembleAction(action?.onError);

  const currentApi = useMemo(() => {
    if (!action?.name) return null;
    return apis?.find((api) => api.name === action.name);
  }, [action?.name, apis]);

  const onAPIResponseAction = useEnsembleAction(currentApi?.onResponse);
  const onAPIErrorAction = useEnsembleAction(currentApi?.onError);

  const invokeCommand = useCommandCallback(
    async (evalContext, ...args: unknown[]) => {
      if (!action?.name || !currentApi) return;

      const context = merge({}, evalContext, args[0]) as {
        [key: string]: unknown;
      };

      if (action.name !== currentApi.name) return;

      const evaluatedInputs = (
        action.inputs ? evaluateDeep(action.inputs, screenModel, context) : {}
      ) as { [key: string]: unknown };

      const hash = generateAPIHash({
        api: currentApi.name,
        inputs: evaluatedInputs,
        screen: screenModel?.id,
      });

      // Set initial loading state
      setData(currentApi.name, {
        isLoading: true,
        statusCode: undefined,
      });

      if (action.id) {
        setData(action.id, {
          isLoading: true,
          statusCode: undefined,
        });
      }

      try {
        const useMockResponse =
          has(currentApi, "mockResponse") &&
          isUsingMockResponse(appContext?.application?.id);

        const response = await queryClient.fetchQuery({
          queryKey: [hash],
          queryFn: () =>
            DataFetcher.fetch(
              currentApi,
              {
                ...context,
                ...evaluatedInputs,
                ensemble: {
                  env: appContext?.env,
                  secrets: appContext?.secrets,
                },
              },
              {
                mockResponse: mockResponse(
                  mockResponses[currentApi.name],
                  useMockResponse,
                ),
                useMockResponse,
              },
            ),
          staleTime:
            currentApi.cacheExpirySeconds && !action.bypassCache
              ? currentApi.cacheExpirySeconds * 1000
              : 0,
        });

        setData(currentApi.name, response);

        if (action.id) {
          setData(action.id, response);
        }

        onAPIResponseAction?.callback({
          ...(args[0] as { [key: string]: unknown }),
          response,
        });
        onInvokeAPIResponseAction?.callback({
          ...(args[0] as { [key: string]: unknown }),
          response,
        });
      } catch (e) {
        logError(e);

        setData(currentApi.name, {
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        if (action.id) {
          setData(action.id, {
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }

        onAPIErrorAction?.callback({
          ...(args[0] as { [key: string]: unknown }),
          error: e,
        });
        onInvokeAPIErrorAction?.callback({
          ...(args[0] as { [key: string]: unknown }),
          error: e,
        });
      }
    },
    { navigate },
    [action, currentApi, screenModel, appContext, queryClient],
  );

  return { callback: invokeCommand };
};

export const useConnectSocket: EnsembleActionHook<ConnectSocketAction> = (
  action,
) => {
  const {
    sockets: screenSockets,
    data: screenData,
    setData: screenDataSetter,
  } = useScreenData();

  const socket = useMemo(
    () => screenSockets?.find((model) => model.name === action?.name),
    [action, screenSockets],
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
        screenDataSetter,
        socket,
        onSocketConnectAction,
        onMessageReceiveAction,
        onSocketDisconnectAction,
      );
    };
    return { callback };
  }, [
    screenData,
    screenDataSetter,
    socket,
    onSocketConnectAction?.callback,
    onMessageReceiveAction?.callback,
    onSocketDisconnectAction?.callback,
  ]);

  return connectSocket;
};

export const useMessageSocket: EnsembleActionHook<SendSocketMessageAction> = (
  action,
) => {
  const { sockets: screenSockets, data: screenData } = useScreenData();
  const [isComplete, setIsComplete] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();
  const evaluatedInputs = useEvaluate(action?.message, { context });

  const socket = useMemo(
    () => screenSockets?.find((model) => model.name === action?.name),
    [action, screenSockets],
  );

  useEffect(() => {
    if (!socket || isComplete !== false) {
      return;
    }

    // send socket message
    handleMessageSocket(screenData, socket, evaluatedInputs);
    setIsComplete(true);
  }, [socket, screenData, evaluatedInputs, isComplete]);

  const callback = useCallback((args: unknown): void => {
    setIsComplete(false);
    setContext(args as { [key: string]: unknown });
  }, []);

  return { callback };
};

export const useDisconnectSocket: EnsembleActionHook<DisconnectSocketAction> = (
  action,
) => {
  const {
    sockets: screenSockets,
    data: screenData,
    setData: screenDataSetter,
  } = useScreenData();

  const socket = useMemo(
    () => screenSockets?.find((model) => model.name === action?.name),
    [action, screenSockets],
  );

  const callback = useCallback((): void => {
    if (socket) {
      handleDisconnectSocket(screenData, socket, screenDataSetter);
    }
  }, [socket, screenData, screenDataSetter]);

  return { callback };
};

export const useShowDialog: EnsembleActionHook<ShowDialogAction> = (
  action?: ShowDialogAction,
) => {
  const { openModal } = useContext(ModalContext) || {};
  const ensembleAction = useEnsembleAction(action?.onDialogDismiss);
  const customScope = useCustomScope();
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  if (!action?.widget && !action?.body)
    throw new Error("ShowDialog Action requires a widget to be specified");

  const widget = useMemo(
    () => unwrapWidget(cloneDeep(action.widget || action.body || {})),
    [action.widget, action.body],
  );

  const callback = useCommandCallback(
    (evalContext, ...args) => {
      const context = merge({}, evalContext, customScope, args[0]);

      const modalOptions = getShowDialogOptions(
        action.options,
        ensembleAction?.callback,
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
            isObject(args[0]) ? (args[0] as CustomScope) : undefined,
          )}
        >
          {EnsembleRuntime.render([widget])}
        </CustomScopeProvider>,
        modalOptions,
        true,
        context,
      );
    },
    { navigate },
    [
      action.options,
      customScope,
      ensembleAction?.callback,
      openModal,
      widget,
      screenModel,
    ],
  );

  return { callback };
};

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const { onComplete, onError, ...rest } = action || {};
  const [files, setFiles] = useState<File[]>();
  const [isComplete, setIsComplete] = useState<boolean>();
  const onCompleteAction = useEnsembleAction(onComplete);
  const onErrorAction = useEnsembleAction(onError);
  const navigate = useNavigate();

  const reset = useCallback(() => {
    if (inputEl) {
      inputEl.value = "";
      inputEl.files = null;
    }
  }, []);

  const { values } = useRegisterBindings(
    {
      files,
      ...rest,
    },
    action?.id,
    {
      setFiles,
      reset,
    },
    {
      comparator: isEqual,
    },
  );

  const allowedExtensions = JSON.stringify(values?.allowedExtensions || []);

  const inputEl = useMemo(() => {
    const input = document.createElement("input");
    if (values?.id) {
      input.id = values.id;
    }
    input.hidden = true;
    input.type = "file";
    input.multiple = values?.allowMultiple || false;
    input.accept =
      (JSON.parse(allowedExtensions) as string[])
        .map((ext) => ".".concat(ext))
        .toString() || "*/*";

    return input;
  }, [values?.allowMultiple, allowedExtensions, values?.id]);

  useEffect(() => {
    document.body.append(inputEl);
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
          values.allowedExtensions?.some((ext) =>
            file.name.toLowerCase().endsWith(ext.toLowerCase()),
          ),
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
  }, [
    onCompleteAction?.callback,
    isComplete,
    files,
    values,
    onErrorAction?.callback,
  ]);

  const callback = useCommandCallback(
    () => {
      try {
        inputEl.click();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    { navigate },
    [inputEl],
  );

  return { callback };
};

export const useUploadFiles: EnsembleActionHook<UploadFilesAction> = (
  action?: UploadFilesAction,
) => {
  const screenModel = useScreenModel();
  const appContext = useApplicationContext();
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

  const callback = useCommandCallback(
    async (evalContext, ...args) => {
      if (!action) return;

      if (!action.uploadApi || !apiModel) return;

      const context = merge({}, evalContext, args[0]);

      const evaluatedInputs = evaluateDeep(
        { files: action.files, inputs: action.inputs },
        screenModel,
        context,
      ) as { files: FileList; inputs: { [key: string]: unknown } };

      const files = evaluatedInputs.files;

      if (isEmpty(files)) throw Error("Files not found");

      try {
        setStatus("running");

        const response = await DataFetcher.uploadFiles(
          apiModel,
          action,
          files,
          progressCallback,
          {
            ...evaluatedInputs.inputs,
            ...context,
            files: evaluatedInputs.files,
            ensemble: {
              env: appContext?.env,
              secrets: appContext?.secrets,
            },
          },
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
        setBody({
          error: (error as Error).message || "Something went wrong",
        });
        setStatus("failed");
        onErrorAction?.callback({ error });
      }
    },
    { navigate: noop },
    [action, apiModel, screenModel, appContext],
  );

  return { callback };
};

export const useNavigateBack: EnsembleActionHook<NavigateBackAction> = () => {
  const modalContext = useContext(ModalContext);
  const navigate = useNavigate();

  const callback = useCommandCallback(
    () => {
      modalContext?.navigateBack();
    },
    { navigate },
    [modalContext],
  );

  return { callback };
};

export const useActionGroup: EnsembleActionHook<ExecuteActionGroupAction> = (
  action,
) => {
  // This ensures hooks are fired in consistent order
  const actions = useMemo(() => action?.actions ?? [], [action]);
  const navigate = useNavigate();

  const execActs = actions.map((act: EnsembleAction) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useEnsembleAction(act);
  });

  const callback = useCommandCallback(
    (evalContext, ...args) => {
      const context = merge({}, evalContext, args[0]);
      execActs.forEach((act) => act?.callback(context));
    },
    { navigate },
    [execActs],
  );

  return { callback };
};

export const useDispatchEvent: EnsembleActionHook<DispatchEventAction> = (
  action,
) => {
  const eventName = keys(action)[0];
  const eventData = (action ? action[eventName] : {}) as {
    [key: string]: unknown;
  };
  const eventScope = useCustomEventScope();
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  // Use a separate hook call for each event action
  const events = get(eventScope, eventName) as {
    [key: string]: unknown;
  };

  const ensembleActions = Object.keys(events).map((customAction) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEnsembleAction({ [customAction]: events[customAction] }),
  );

  const callback = useCommandCallback(
    (evalContext, ...args) => {
      const context = merge({}, evalContext, args[0]);
      const evaluatedData = evaluateDeep(eventData, screenModel, context);

      ensembleActions.forEach((act) =>
        act?.callback({
          ...evaluatedData,
          ...context,
        }),
      );
    },
    { navigate },
    [ensembleActions, eventData, screenModel],
  );

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
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  const callback = useCommandCallback(
    (evalContext, ...args) => {
      const context = merge({}, evalContext, args[0]);

      // Evaluate conditions
      const evaluatedStatements = evaluateDeep(
        conditionStatements as unknown as { [key: string]: unknown },
        screenModel,
        context,
      );

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
        } else {
          // if no condition is true, return
          return;
        }
      }

      execActs[trueIndex]?.callback(context);
    },
    { navigate },
    [action.conditions, conditionStatements, execActs, screenModel],
  );

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
