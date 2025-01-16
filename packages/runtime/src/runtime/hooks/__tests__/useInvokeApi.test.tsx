/* eslint import/first: 0 */
const fetchMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
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

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  queryClient.clear();
});

test("fetch API cache response for cache expiry", async () => {
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
                onResponse: { executeCode: "console.log(response.body.data)" },
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

test("fetch API cache response for unique inputs while cache expiry", async () => {
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

test("fetch API without cache", async () => {
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
                onResponse: { executeCode: "console.log(response.body.data)" },
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

test("after API response modal should close", async () => {
  fetchMock.mockResolvedValue({ body: { data: "foobar" } });

  render(
    <EnsembleScreen
      screen={{
        name: "test_cache",
        id: "test_cache",
        body: {
          name: "Button",
          properties: {
            label: "Show Dialog",
            onTap: {
              showDialog: {
                widget: {
                  Column: {
                    children: [
                      {
                        Text: {
                          text: "This is modal",
                        },
                      },
                      {
                        Button: {
                          label: "Trigger API",
                          onTap: {
                            invokeAPI: {
                              name: "testCache",
                              onResponse: {
                                executeCode: "ensemble.closeAllDialogs()",
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
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

  const showDialogButton = screen.getByText("Show Dialog");
  fireEvent.click(showDialogButton);

  const modalTitle = screen.getByText("This is modal");
  const triggerAPIButton = screen.getByText("Trigger API");

  await waitFor(() => {
    expect(modalTitle).toBeInTheDocument();
    expect(triggerAPIButton).toBeInTheDocument();
  });

  fireEvent.click(triggerAPIButton);

  await waitFor(() => {
    expect(modalTitle).not.toBeInTheDocument();
    expect(triggerAPIButton).not.toBeInTheDocument();
  });
});

test.only("fetch API with force cache clear", async () => {
  fetchMock.mockResolvedValue({ body: { data: "foobar" } });

  render(
    <EnsembleScreen
      screen={{
        name: "test_force_cache_clear",
        id: "test_force_cache_clear",
        body: {
          name: "Column",
          properties: {
            children: [
              {
                name: "Button",
                properties: {
                  label: "Without Force",
                  onTap: { invokeAPI: { name: "testForceCache" } },
                },
              },
              {
                name: "Button",
                properties: {
                  label: "With Force",
                  onTap: {
                    invokeAPI: {
                      name: "testForceCache",
                      forceRefresh: true,
                    },
                  },
                },
              },
            ],
          },
        },
        apis: [
          {
            name: "testForceCache",
            method: "GET",
            cacheExpirySeconds: 60,
          },
        ],
      }}
    />,
    { wrapper: BrowserRouterWrapper },
  );

  const withoutForce = screen.getByText("Without Force");
  fireEvent.click(withoutForce);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  fireEvent.click(withoutForce);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  const withForce = screen.getByText("With Force");
  fireEvent.click(withForce);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
