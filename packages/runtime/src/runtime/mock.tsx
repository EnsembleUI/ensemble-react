import { EnsembleMockResponse, useEvaluate } from "@ensembleui/react-framework";

export const mock = (evaluatedMockResponse: {
    response: string | EnsembleMockResponse | undefined;
}): {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    statusCode: number;
    body: object | string;
    headers?: Record<string, string>;
    reasonPhrase?: string;
} => {
    if (typeof evaluatedMockResponse.response !== "object" || evaluatedMockResponse.response === null)
        throw new Error(
            "Improperly formatted mock response: Malformed mockResponse object",
        );

    if (
        !evaluatedMockResponse.response.statusCode ||
        typeof evaluatedMockResponse.response.statusCode !== "number"
    )
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
}