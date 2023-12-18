import type * as fetcher from "./fetcher";

export * from "./fetcher";
export * from "./dateFormatter";

export interface Response {
  body?: string | object;
  statusCode?: number;
  headers?: fetcher.Headers;
  reasonPhrase?: string;

  isSuccess: boolean;
  isError: boolean;
}
