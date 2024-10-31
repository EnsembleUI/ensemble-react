import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import axios from "axios";
import { get, head, isObject } from "lodash-es";
import type { EnsembleAPIModel } from "../shared/models";
import { replace, visitExpressions, type UploadFilesAction } from "../shared";
import { evaluate } from "../evaluate/evaluate";
import { ensembleStore, screenAtom } from "../state";
import type { Response } from "./index";

export type Headers = AxiosResponseHeaders;

class EnsembleResponse implements Response {
  body?: string | object | undefined;
  statusCode?: number | undefined;
  headers?: Headers;
  reasonPhrase?: string | undefined;
  isLoading = false;
  get isSuccess(): boolean {
    return (
      Boolean(this.statusCode) &&
      Number(this.statusCode) >= 200 &&
      Number(this.statusCode) <= 299
    );
  }
  get isError(): boolean {
    return !this.isSuccess;
  }

  static fromAxiosResponse(axRes: AxiosResponse): EnsembleResponse {
    const response = new EnsembleResponse();
    response.statusCode = axRes.status;
    response.headers = axRes.headers;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    response.body = axRes.data;
    response.isLoading = false;
    return response;
  }
}

export const DataFetcher = {
  fetch: async (
    api: EnsembleAPIModel,
    context?: { [key: string]: unknown },
    options?: {
      mockResponse: EnsembleResponse;
      useMockResponse: boolean;
    },
  ): Promise<Response> => {
    const resolvedInputs = resolve(
      {
        path: api.url || api.uri,
        body: api.body,
        headers: api.headers,
      },
      context,
    );
    // If useMockResponse is enabled, return the computed mockResponse
    if (options?.useMockResponse) {
      return options.mockResponse;
    }
    const axRes = await axios({
      url: resolvedInputs?.path,
      method: api.method,
      headers: resolvedInputs?.headers,
      data: resolvedInputs?.body,
    });
    return EnsembleResponse.fromAxiosResponse(axRes);
  },
  uploadFiles: async (
    api: EnsembleAPIModel,
    action: UploadFilesAction,
    files: FileList,
    progressCallback?: (progressEvent: ProgressEvent) => void,
    context?: { [key: string]: unknown },
  ): Promise<Response> => {
    const resolvedInputs = resolve(
      {
        url: api.url || api.uri,
        headers: api.headers,
      },
      context,
    );

    const contentType = get(resolvedInputs?.headers, "Content-Type");
    let body;
    if (contentType === "application/octet-stream") {
      // We only upload one file if binary
      const file = head(files);
      body = await file?.arrayBuffer();
    } else {
      const formData = new FormData();
      const fieldName = action.fieldName ?? "files";
      if (files.length === 1) {
        formData.append(fieldName, files[0]);
      } else {
        for (let i = 0; i < files.length; i++) {
          formData.append(`${fieldName}${i}`, files[i]);
        }
      }

      if (isObject(api.body)) {
        const apiModelBody = api.body as { [key: string]: unknown };
        for (const key in apiModelBody) {
          const evaluatedValue = resolve(apiModelBody[key], context);
          formData.append(key, evaluatedValue as string);
        }
      }
      body = formData;
    }

    const axRes = await axios({
      url: resolvedInputs?.url,
      method: api.method,
      headers: resolvedInputs?.headers,
      data: body,

      onUploadProgress: progressCallback,
    });
    return EnsembleResponse.fromAxiosResponse(axRes);
  },
};

const resolve = <T>(
  body?: T,
  context?: { [key: string]: unknown },
): T | undefined => {
  if (!body) {
    return;
  }

  const screenContext = ensembleStore.get(screenAtom);
  const evaluator = (expr: string): string => {
    return evaluate(screenContext, expr, context);
  };
  const resolvedBody = visitExpressions(body, replace(evaluator));
  return resolvedBody as T;
};
