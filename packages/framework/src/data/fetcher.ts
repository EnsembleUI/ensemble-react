import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import axios from "axios";
import { cloneDeep, get, isObject, isString, set } from "lodash-es";
import type { EnsembleAPIModel } from "../shared/models";
import { type Expression } from "../shared";
import { evaluate } from "../evaluate";
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
    context?: Record<string, unknown>,
  ): Promise<Response> => {
    const resolvedBody = resolve(api.body, context);
    const url = new URL(api.uri);
    const resolvedParams = resolve(
      Object.fromEntries(url.searchParams.entries()),
      context,
    );

    const axRes = await axios({
      url: api.uri.replace(url.search, ""),
      method: api.method,
      headers: api.headers,
      params: resolvedParams,
      data: resolvedBody,
    });
    return EnsembleResponse.fromAxiosResponse(axRes);
  },
  uploadFiles: async (
    url: string,
    method: string,
    headers: Headers,
    body?: Record<string, Expression<unknown>> | FormData,
    progressCallback?: (progressEvent: ProgressEvent) => void,
  ): Promise<Response> => {
    const axRes = await axios({
      url,
      method,
      headers,
      data: body,

      onUploadProgress: progressCallback,
    });
    return EnsembleResponse.fromAxiosResponse(axRes);
  },
};

const resolve = (
  body?: string | object,
  context?: Record<string, unknown>,
): unknown => {
  if (!body) {
    return;
  }

  const screenContext = ensembleStore.get(screenAtom);
  const replace = (val: string): string =>
    val.replace(/\$\{[^}]+\}/, (expression) => {
      return evaluate(screenContext, expression, context);
    });
  const resolvedBody = visitAndReplaceExpressions(body, replace);
  return resolvedBody;
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
