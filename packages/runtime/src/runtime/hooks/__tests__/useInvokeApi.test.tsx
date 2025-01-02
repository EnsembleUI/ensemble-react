/* eslint import/first: 0 */
const fetchMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import "../../../widgets";
import { BrowserRouter } from "react-router-dom";
import { EnsembleScreen } from "../../screen";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@ensembleui/react-framework", () => ({
  ...frameworkActual,
  DataFetcher: {
    fetch: fetchMock,
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

describe("test API cache", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    queryClient.clear();
  });

  it("fetch API cache response for cache expiry", async () => {
    const logSpy = jest.spyOn(console, "log");

    fetchMock.mockResolvedValue({ body: { data: "foobar" } });

    render(
      <EnsembleScreen
        screen={{
          name: "test_cache",
          id: "test_cache",
          body: {
            name: "Button",
            properties: {
              label: "Test Cache",
              onTap: {
                invokeAPI: {
                  name: "testCache",
                  onResponse: {
                    executeCode: "console.log(response.body.data)",
                  },
                },
              },
            },
          },
          apis: [{ name: "testCache", method: "GET", cacheExpirySeconds: 5 }],
        }}
      />,
      { wrapper: BrowserRouterWrapper },
    );

    const button = screen.getByText("Test Cache");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(5000);

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith("foobar");
    });
  });

  it("fetch API cache response for unique inputs while cache expiry", async () => {
    fetchMock.mockResolvedValue({ body: { data: "foobar" } });

    render(
      <EnsembleScreen
        screen={{
          name: "test_cache",
          id: "test_cache",
          body: {
            name: "Column",
            properties: {
              children: [
                {
                  name: "Button",
                  properties: {
                    label: "Page 1",
                    onTap: { invokeAPI: { name: "testCache", inputs: [1] } },
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Page 2",
                    onTap: { invokeAPI: { name: "testCache", inputs: [2] } },
                  },
                },
              ],
            },
          },
          apis: [
            {
              name: "testCache",
              method: "GET",
              inputs: ["page"],
              cacheExpirySeconds: 60,
            },
          ],
        }}
      />,
      { wrapper: BrowserRouterWrapper },
    );

    const button = screen.getByText("Page 1");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const button2 = screen.getByText("Page 2");
    fireEvent.click(button2);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it("fetch API without cache", async () => {
    const logSpy = jest.spyOn(console, "log");

    fetchMock.mockResolvedValue({ body: { data: "foobar" } });

    render(
      <EnsembleScreen
        screen={{
          name: "test_cache",
          id: "test_cache",
          body: {
            name: "Button",
            properties: {
              label: "Trigger API",
              onTap: {
                invokeAPI: {
                  name: "testCache",
                  onResponse: {
                    executeCode: "console.log(response.body.data)",
                  },
                },
              },
            },
          },
          apis: [{ name: "testCache", method: "GET" }],
        }}
      />,
      { wrapper: BrowserRouterWrapper },
    );

    const button = screen.getByText("Trigger API");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith("foobar");
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});

describe("test ensemble.invokeAPI onResponse and onError", () => {
  it("test executeCode and ensemble.invokeAPI with onLoad", async () => {
    const logSpy = jest.spyOn(console, "log");

    render(
      <EnsembleScreen
        screen={{
          name: "test_execute_code",
          id: "test_execute_code",
          body: {
            name: "Row",
            properties: {
              children: [
                {
                  name: "Button",
                  properties: {
                    label: "Trigger Invoke API",
                    onTap: {
                      executeCode: "ensemble.invokeAPI('testInvokeAPI')",
                    },
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Trigger API",
                    onTap: {
                      invokeAPI: {
                        name: "testAPI",
                        onResponse: "console.log('onResponse from inside')",
                      },
                    },
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Trigger API Error",
                    onTap: "ensemble.invokeAPI('testOnError')",
                  },
                },
              ],
            },
          },
          apis: [
            {
              method: "GET",
              name: "testInvokeAPI",
              uri: "https://dummyjson.com/products",
              onResponse: `
              console.log('onResponse from invokeAPI');
              console.log({ response });
              `,
            },
            {
              method: "GET",
              name: "testAPI",
              uri: "https://dummyjson.com/products",
              onResponse: "console.log('onResponse from API')",
            },
            {
              method: "GET",
              name: "testOnError",
              uri: "https://dummyjson.com/products_error",
              onError: `
              console.log('onError from API');
              console.log({ error: error.message });
              `,
            },
          ],
          onLoad: {
            executeCode: "ensemble.invokeAPI('testAPI')",
          },
        }}
      />,
      { wrapper: BrowserRouterWrapper },
    );

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("onResponse from API");
    });

    const button = screen.getByText("Trigger Invoke API");
    fireEvent.click(button);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("onResponse from invokeAPI");
    });

    const triggerAPI = screen.getByText("Trigger API");
    fireEvent.click(triggerAPI);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("onResponse from API");
      expect(logSpy).toHaveBeenCalledWith("onResponse from inside");
    });

    const triggerAPIError = screen.getByText("Trigger API Error");
    fireEvent.click(triggerAPIError);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("onError from API");
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Request failed with status code 404",
        }),
      );
    });
  });
});
