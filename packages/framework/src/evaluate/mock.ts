import { isObject, isNumber, isEmpty } from "lodash-es";
import type { EnsembleMockResponse } from "../shared";

export const mockResponse = (
  evaluatedMockResponse: string | EnsembleMockResponse | undefined,
  isUsingMockResponse: boolean,
): {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  statusCode: number;
  body: object | string;
  headers?: { [key: string]: string };
  reasonPhrase?: string;
} => {
  if (!isUsingMockResponse)
    return {
      isLoading: false,
      isSuccess: false,
      isError: true,
      statusCode: 500,
      body: "Not using mock response",
    };
  if (isEmpty(evaluatedMockResponse) || !isObject(evaluatedMockResponse))
    throw new Error(
      "Improperly formatted mock response: Malformed mockResponse object",
    );

  if (!isNumber(evaluatedMockResponse.statusCode))
    throw new Error(
      "Improperly formatted mock response: Incorrect Status Code. Please check that you have included a status code and that it is a number",
    );

  const isSuccess =
    evaluatedMockResponse.statusCode >= 200 &&
    evaluatedMockResponse.statusCode <= 299;
  const mockRes = {
    ...evaluatedMockResponse,
    isLoading: false,
    isSuccess,
    isError: !isSuccess,
  };
  return mockRes;
};
