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
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
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

afterEach(() => {
  jest.clearAllMocks();
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
      wrapper: BrowserRouter,
    },
  );

  act(() => {
    result.current?.callback();
  });

  expect(logSpy).toHaveBeenCalledWith("foo");
  expect(logSpy).toHaveBeenCalledWith("bar");
});

test("fetch multiple APIs", () => {
  const logSpy = jest.spyOn(console, "log");

  fetchMock.mockResolvedValueOnce({
    body: {
      data: "foo",
    },
  });
  fetchMock.mockResolvedValueOnce({
    body: {
      data: "bar",
    },
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
      wrapper: BrowserRouter,
    },
  );

  expect(fetchMock).toHaveBeenCalledTimes(2);

  act(() => {
    const button = screen.getByText("test");
    fireEvent.click(button);
  });

  expect(logSpy).toHaveBeenCalledWith("foo");
  expect(logSpy).toHaveBeenCalledWith("bar");
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
      wrapper: BrowserRouter,
    },
  );

  const button = screen.getByText("test");
  fireEvent.click(button);

  expect(logSpy).toHaveBeenCalledWith("bar");
  expect(logSpy).toHaveBeenCalledWith("bar2");
});
