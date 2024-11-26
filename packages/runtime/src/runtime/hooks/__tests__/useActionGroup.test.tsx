/* eslint import/first: 0 */
const fetchMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useActionGroup } from "../useEnsembleAction";
import { createCustomWidget } from "../../customWidget";
import { Button } from "../../../widgets";
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

afterEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
});

test("execute multiple actions", () => {
  const logSpy = jest.spyOn(console, "log");
  const { result } = renderHook(
    () =>
      useActionGroup({
        actions: [
          {
            executeCode: 'console.log("foo")',
          },
          {
            executeCode: 'console.log("bar")',
          },
        ],
      }),
    {
      wrapper: BrowserRouterWrapper,
    },
  );

  act(() => {
    result.current?.callback();
  });

  expect(logSpy).toHaveBeenCalledWith("foo");
  expect(logSpy).toHaveBeenCalledWith("bar");
});

test("fetch multiple APIs", async () => {
  const logSpy = jest.spyOn(console, "log");

  fetchMock.mockResolvedValueOnce({
    body: {
      data: "foo",
    },
    isLoading: false,
  });
  fetchMock.mockResolvedValueOnce({
    body: {
      data: "bar",
    },
    isLoading: false,
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
                name: "Text",
                properties: {
                  // eslint-disable-next-line no-template-curly-in-string
                  text: "${'test1' + test1.isLoading}",
                },
              },
              {
                name: "Text",
                properties: {
                  // eslint-disable-next-line no-template-curly-in-string
                  text: "${'test2' + test2.isLoading}",
                },
              },
              {
                name: "Button",
                properties: {
                  label: "test",
                  onTap: {
                    executeCode: {
                      body: `
                        console.log(test1?.body?.data)
                        console.log(test2?.body?.data)
                      `,
                    },
                  },
                },
              },
            ],
          },
        },
        apis: [
          {
            name: "test1",
            method: "GET",
          },
          {
            name: "test2",
            method: "GET",
          },
        ],
        onLoad: {
          executeActionGroup: {
            actions: [
              {
                invokeAPI: {
                  name: "test1",
                },
              },
              {
                invokeAPI: {
                  name: "test2",
                },
              },
            ],
          },
        },
      }}
    />,
    {
      wrapper: BrowserRouterWrapper,
    },
  );

  expect(fetchMock).toHaveBeenCalledTimes(2);

  await waitFor(() => {
    expect(screen.getByText("test1false")).toBeInTheDocument();
    expect(screen.getByText("test2false")).toBeInTheDocument();
  });

  act(() => {
    const button = screen.getByText("test");
    fireEvent.click(button);
  });

  await waitFor(() => {
    expect(logSpy).toHaveBeenCalledWith("foo");
    expect(logSpy).toHaveBeenCalledWith("bar");
  });
});

test("mutate multiple storage variables", () => {
  const logSpy = jest.spyOn(console, "log");
  const Test = createCustomWidget({
    onLoad: {
      executeActionGroup: {
        actions: [
          {
            executeCode: "ensemble.storage.set('foo', 'bar')",
          },
          {
            executeCode: "ensemble.storage.set('foo2', 'bar2')",
          },
        ],
      },
    },
    name: "",
    inputs: [],
    body: {
      name: "Row",
      properties: {},
    },
  });

  render(
    <>
      <Test events={{}} inputs={{}} />
      <Button
        label="test"
        onTap={{
          executeCode: {
            body: `
              console.log(ensemble.storage.get('foo'))
              console.log(ensemble.storage.get('foo2'))
            `,
          },
        }}
      />
    </>,
    {
      wrapper: BrowserRouterWrapper,
    },
  );

  const button = screen.getByText("test");
  fireEvent.click(button);

  expect(logSpy).toHaveBeenCalledWith("bar");
  expect(logSpy).toHaveBeenCalledWith("bar2");
});
