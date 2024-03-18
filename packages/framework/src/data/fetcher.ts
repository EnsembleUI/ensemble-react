import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import axios from "axios";
import { cloneDeep, get, head, isObject, isString, set } from "lodash-es";
import type { EnsembleAPIModel } from "../shared/models";
import { type UploadFilesAction } from "../shared";
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
  ): Promise<Response> => {
    const uri = new URL(api.uri);

    const resolvedInputs = resolve(
      {
        path: api.uri.replace(uri.search, ""),
        body: api.body,
        headers: api.headers,
        params: Object.fromEntries(uri.searchParams),
      },
      context,
    );
    const axRes = await axios({
      url: resolvedInputs?.path,
      method: api.method,
      headers: resolvedInputs?.headers,
      params: resolvedInputs?.params,
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
        url: api.uri,
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
  const replace = (val: string): string =>
    val.replace(/\$\{[^}]+\}/g, (expression) => {
      return evaluate(screenContext, expression, context);
    });
  const resolvedBody = visitAndReplaceExpressions(body, replace);
  return resolvedBody as T;
};

const visitAndReplaceExpressions = (
  obj: unknown,
  replace: (expr: string) => unknown,
): unknown => {
  let clonedObj = cloneDeep(obj);
  if (isObject(clonedObj)) {
    if (Array.isArray(clonedObj)) {
      // If obj is an array, recursively visit and replace elements
      for (let i = 0; i < clonedObj.length; i++) {
        clonedObj[i] = visitAndReplaceExpressions(clonedObj[i], replace);
      }
    } else {
      // If obj is an object, recursively visit and replace values
      for (const key in clonedObj) {
        const result = visitAndReplaceExpressions(get(clonedObj, key), replace);
        set(clonedObj, key, result);
      }
    }
  } else if (isString(obj)) {
    clonedObj = replace(obj);
  }

  return clonedObj;
};
