import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import axios from "axios";
import { isObject } from "lodash-es";
import type { EnsembleAPIModel } from "../shared/models";
import { isExpression, type Expression } from "../shared";
import { evaluate } from "../evaluate";
import { ensembleStore, screenAtom } from "../state";
import type { Response } from "./index";

export type Headers = AxiosResponseHeaders;

class EnsembleResponse implements Response {
  body?: string | object | undefined;
  statusCode?: number | undefined;
  headers?: Headers;
  reasonPhrase?: string | undefined;
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
    return response;
  }
}

export const DataFetcher = {
  fetch: async (
    api: EnsembleAPIModel,
    context?: Record<string, unknown>,
  ): Promise<Response> => {
    const resolvedBody = resolveBody(api.body, context);
    const url = new URL(api.uri);
    const resolvedParams = resolveBody(
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

const resolveBody = (
  body?: Record<string, Expression<unknown>>,
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!body) {
    return;
  }

  const resolvedValues = Object.entries(body).map(([key, value]) => {
    if (isExpression(value)) {
      const resolvedValue = evaluate(
        ensembleStore.get(screenAtom),
        value,
        context,
      );
      return [key, resolvedValue];
    }
    if (isObject(value)) {
      const resolvedValue = resolveBody(value as Record<string, unknown>);
      return [key, resolvedValue];
    }
    return [key, value];
  });

  return Object.fromEntries(resolvedValues) as Record<string, unknown>;
};
