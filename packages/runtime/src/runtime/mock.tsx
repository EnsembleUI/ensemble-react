import type { EnsembleMockResponse } from "@ensembleui/react-framework";
import { isObject, isNumber, isEmpty } from "lodash-es";

export const mock = (evaluatedMockResponse: {
  response: string | EnsembleMockResponse | undefined;
}): {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  statusCode: number;
  body: object | string;
  headers?: { [key: string]: string };
  reasonPhrase?: string;
} => {
  if (
    isEmpty(evaluatedMockResponse.response) ||
    !isObject(evaluatedMockResponse.response)
  )
    throw new Error(
      "Improperly formatted mock response: Malformed mockResponse object",
    );

  if (!isNumber(evaluatedMockResponse.response.statusCode))
    throw new Error(
      "Improperly formatted mock response: Incorrect Status Code. Please check that you have included a status code and that it is a number",
    );

  const isSuccess =
    evaluatedMockResponse.response.statusCode >= 200 &&
    evaluatedMockResponse.response.statusCode <= 299;
  const mockRes = {
    ...evaluatedMockResponse.response,
    isLoading: false,
    isSuccess,
    isError: !isSuccess,
  };
  return mockRes;
};
