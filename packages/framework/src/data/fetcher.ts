import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import axios from "axios";
import type { APIModel } from "../models";
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
    response.body = String(axRes.data);
    return response;
  }
}

export const DataFetcher = {
  fetch: async (api: APIModel): Promise<Response> => {
    const axRes = await axios.get(api.uri, { method: api.method });
    return EnsembleResponse.fromAxiosResponse(axRes);
  },
};
