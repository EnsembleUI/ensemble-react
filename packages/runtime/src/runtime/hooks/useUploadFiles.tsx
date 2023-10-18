import { useState } from "react";
import {
  type UploadFilesAction,
  useRegisterBindings,
  evaluate,
  useScreenContext,
  type ScreenContextDefinition,
  DataFetcher,
  isExpression,
} from "framework";
import { head } from "lodash-es";
// eslint-disable-next-line import/no-cycle
import {
  useEnsembleAction,
  type EnsembleActionHook,
} from "./useEnsembleAction";

type UploadStatus =
  | "pending"
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

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

  const apiModel = screenContext?.model?.apis?.find(
    (model) => model?.name === action?.uploadApi,
  );
  if (!apiModel) return;

  const callback = async (): Promise<void> => {
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
      formData.append(key, apiModelBody[key] as string);
    }

    const resolvedInputs = Object.entries(action?.inputs ?? {})
      .concat((apiModel?.inputs ?? []) as [string, unknown][])
      .map(([key, value]) => {
        if (isExpression(value)) {
          const resolvedValue = evaluate(
            screenContext as ScreenContextDefinition,
            value,
          );
          return [key, resolvedValue];
        }
        return [key, value];
      });

    const progressCallback = (progressEvent: ProgressEvent): void => {
      const percentCompleted =
        (progressEvent.loaded * 100) / progressEvent.total;

      setProgress(percentCompleted);
    };

    try {
      setStatus("running");
      const response = await DataFetcher.uploadFiles(
        apiModel.uri,
        apiModel.method,
        {
          "Content-Type": "multipart/form-data",
          ...apiModel.headers,
        },
        formData,
        Object.fromEntries(resolvedInputs) as Record<string, unknown>,
        progressCallback,
      );

      setBody(response.body as Record<string, unknown>);
      setHeaders(response.headers as Record<string, unknown>);
      if (response.isSuccess) {
        setStatus("completed");
        onCompleteAction?.callback();
      } else {
        setStatus("failed");
        onErrorAction?.callback();
      }
    } catch (err: unknown) {
      setBody(err as Record<string, unknown>);
      setStatus("failed");
      onErrorAction?.callback();
    }
  };

  return { callback };
};
