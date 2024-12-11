/* eslint import/first: 0 */
const fetchMock = jest.fn();
const uploadMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import { act, render, renderHook, waitFor } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useEnsembleAction } from "../useEnsembleAction";
import { EnsembleScreen } from "../../screen";
import "../../../widgets";

jest.mock("react-markdown", jest.fn());

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@ensembleui/react-framework", () => ({
  ...frameworkActual,
  DataFetcher: {
    fetch: fetchMock,
    uploadFiles: uploadMock,
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface BrowserRouterProps {
  children: ReactNode;
}

const BrowserRouterWrapper = ({ children }: BrowserRouterProps) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <BrowserRouter>
    <ScreenContextProvider
      context={{
        widgets: {
          myWidget: {
            values: {
              value: 2,
            },
            invokable: {
              id: "myWidget",
            },
          },
        },
        data: {},
        storage: {},
      }}
      screen={{
        id: "test",
        name: "test",
        body: { name: "Widget", properties: {} },
        apis: [
          {
            name: "getDummyProductsByPaginate",
            method: "GET",
            // eslint-disable-next-line no-template-curly-in-string
            uri: "https://dummyjson.com/products?skip=${skip}&limit=${limit}",
            inputs: ["skip", "limit"],
          },
        ],
      }}
    >
      {children}
    </ScreenContextProvider>
  </BrowserRouter>
);

describe("Test cases for useEnsembleAction Hook", () => {
  it("should return undefined when no action is provided", () => {
    const { result } = renderHook(() => useEnsembleAction(undefined));

    expect(result.current).toBeUndefined();
  });

  it("should return useExecuteCode when action is a string", async () => {
    const { result } = renderHook(() => useEnsembleAction("myWidget.value"), {
      wrapper,
    });

    let execResult;

    await act(async () => {
      execResult = await result.current?.callback();
    });

    expect(execResult).toBe(2);
  });

  it("Upload files using pick files and call invoke and upload api", async () => {
    const logSpy = jest.spyOn(console, "log");

    fetchMock.mockResolvedValue({
      body: { data: "foo" },
      isLoading: false,
      isSuccess: true,
      isError: false,
    });

    uploadMock.mockResolvedValue({
      body: { data: "bar" },
      isLoading: false,
      isSuccess: true,
      isError: false,
    });

    render(
      <EnsembleScreen
        screen={{
          name: "test",
          id: "test",
          body: {
            name: "Row",
            properties: {
              children: [
                {
                  name: "Button",
                  properties: {
                    label: "Pick Image",
                    onTap: {
                      pickFiles: {
                        allowedExtensions: ["jpg", "png"],
                        onComplete: {
                          executeCode: {
                            body: "console.log('first')",
                            onComplete: {
                              invokeAPI: {
                                name: "createMediaByName",
                                onResponse: {
                                  uploadFiles: {
                                    files: `\${files}`,
                                    uploadApi: "uploadFile",
                                    onComplete: {
                                      executeCode: "console.log('done')",
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
          apis: [
            {
              name: "createMediaByName",
              method: "POST",
            },
            {
              name: "uploadFile",
              method: "POST",
            },
          ],
        }}
      />,
      {
        wrapper: BrowserRouterWrapper,
      },
    );

    const imageBlob = new Blob(["image binary data"], { type: "image/png" });

    const files = [
      new File([imageBlob], "example1.png", { type: "image/png" }),
    ];

    const pickFiles = document.querySelector("input") as HTMLInputElement;

    act(() => {
      userEvent.upload(pickFiles, files);
    });

    await waitFor(() => {
      expect(pickFiles.files).toHaveLength(1);
      expect(pickFiles.files?.[0].name).toBe("example1.png");
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(uploadMock).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith("first");
      expect(logSpy).toHaveBeenCalledWith("done");
    });
  });
});
