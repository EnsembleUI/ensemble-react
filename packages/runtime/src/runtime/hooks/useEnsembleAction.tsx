import {
  DataFetcher,
  useScreenContext,
  evaluate,
  isExpression,
  useRegisterBindings,
} from "framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  Response,
  EnsembleAction,
  PickFilesAction,
  UploadFilesAction,
  ScreenContextDefinition,
} from "framework";
import { head, isString, merge } from "lodash-es";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigateScreen } from "./useNavigateScreen";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useShowToast } from "./useShowToast";
import { useCloseAllDialogs } from "./useCloseAllDialogs";

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
  const js = isCodeString ? action : action?.body;
  const screen = useScreenContext();

  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete,
  );
  const execute = useMemo(() => {
    if (!screen || !js) {
      return;
    }

    return (args: unknown) => {
      const retVal = evaluate(screen, js, merge({}, options?.context, args));
      onCompleteAction?.callback();
      return retVal;
    };
  }, [screen, js, options?.context, onCompleteAction]);
  return execute ? { callback: execute } : undefined;
};

export const useInvokeApi: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const screenContext = useScreenContext();

  const [response, setResponse] = useState<Response>();
  const [error, setError] = useState<unknown>();

  const invokeApi = useMemo(() => {
    if (!screenContext?.model || !action) {
      return;
    }

    const apiModel = screenContext.model.apis?.find(
      (model) => model.name === action.name,
    );
    if (!apiModel) {
      return;
    }

    const inputs = action.inputs ?? {};
    const callback = async (): Promise<void> => {
      const resolvedInputs = Object.entries(inputs).map(([key, value]) => {
        if (isExpression(value)) {
          const resolvedValue = evaluate(screenContext, value);
          return [key, resolvedValue];
        }
        return [key, value];
      });
      try {
        const res = await DataFetcher.fetch(
          apiModel,
          Object.fromEntries(resolvedInputs) as Record<string, unknown>,
        );
        screenContext.setData(apiModel.name, res);
        setResponse(res);
      } catch (e) {
        setError(e);
      }
    };
    return { callback };
  }, [action, screenContext?.model]);

  const onResponseAction = useEnsembleAction(action?.onResponse);
  useEffect(() => {
    if (!response) {
      return;
    }

    onResponseAction?.callback({ response });
  }, [action?.onResponse, onResponseAction, response]);

  const onErrorAction = useEnsembleAction(action?.onError);
  useEffect(() => {
    if (!error) {
      return;
    }

    onErrorAction?.callback({ error });
  }, [action?.onError, error, onErrorAction]);

  return invokeApi;
};

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const [files, setFiles] = useState<FileList>();
  const onCompleteAction = useEnsembleAction(action?.onComplete);

  useRegisterBindings(
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
        setFiles(selectedFiles);
        onCompleteAction?.callback();
      }
    };

    return input;
  }, [action?.allowMultiple, action?.allowedExtensions, onCompleteAction]);

  useEffect(() => {
    return () => {
      inputEl.remove();
    };
  }, [inputEl]);

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
      (model) => model?.name === action?.uploadApi,
    );
    if (!apiModel) return;

    const progressCallback = (progressEvent: ProgressEvent): void => {
      const percentCompleted =
        (progressEvent.loaded * 100) / progressEvent.total;

      setProgress(percentCompleted);
    };

    const files = evaluate(
      screenContext as ScreenContextDefinition,
      action?.files,
    ) as FileList | undefined;
    if (!files || files.length === 0) throw Error("Files not found");

    const formData = new FormData();
    if (files.length === 1)
      formData.append(action?.fieldName ?? "files", head(files) as Blob);
    else
      for (let i = 0; i < files.length; i++) {
        formData.append(action?.fieldName ?? `file${i}`, files[i]);
      }

    const apiModelBody = apiModel?.body ?? {};
    for (const key in apiModelBody) {
      const evaluatedValue = isExpression(apiModelBody[key])
        ? evaluate(
            screenContext as ScreenContextDefinition,
            apiModelBody[key] as string,
          ) || action?.inputs?.[key]
        : apiModelBody[key];
      formData.append(key, evaluatedValue as string);
    }

    let apiUrl = apiModel.uri;
    apiUrl = apiUrl.replace(
      /\${(.*?)}/g,
      (match, p1) =>
        (evaluate(screenContext as ScreenContextDefinition, match) as string) ||
        (action?.inputs?.[p1] as string),
    );

    // Regular expression for text matches inside ${}
    const matches = [...apiUrl.matchAll(/\${(.*?)}/g)];

    // Replace matches with the evaluated value
    matches.forEach((match) => {
      apiUrl = apiUrl.replace(
        match[0],
        (evaluate(
          screenContext as ScreenContextDefinition,
          match[0],
        ) as string) || (action?.inputs?.[match[1]] as string),
      );
    });

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
    action?.uploadApi,
    action?.fieldName,
    action?.files,
    action?.inputs,
    onCompleteAction,
    onErrorAction,
    screenContext,
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
  const invokeApi = useInvokeApi(action.invokeApi, options);
  const executeCode = useExecuteCode(
    action.executeCode,
    options as UseExecuteCodeActionOptions,
  );
  const navigateScreen = useNavigateScreen(action.navigateScreen, options);
  const showToast = useShowToast(action.showToast);
  const navigateModalScreen = useNavigateModalScreen(
    action.navigateModalScreen,
    options as null,
  );
  const closeAllDialogs = useCloseAllDialogs();

  const pickFiles = usePickFiles(action.pickFiles);
  const uploadFiles = useUploadFiles(action.uploadFiles);

  return (
    (action.invokeApi && invokeApi) ||
    (action.executeCode && executeCode) ||
    (action.navigateScreen && navigateScreen) ||
    (action.showToast && showToast) ||
    (action.navigateModalScreen && navigateModalScreen) ||
    ("closeAllDialogs" in action && closeAllDialogs) ||
    (action.pickFiles && pickFiles) ||
    (action.uploadFiles && uploadFiles)
  );
};
/* eslint-enable react-hooks/rules-of-hooks */
