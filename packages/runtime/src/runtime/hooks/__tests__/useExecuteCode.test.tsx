/* eslint import/first: 0 */
import { act, renderHook } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useExecuteCode } from "../useEnsembleAction";

jest.mock("react-markdown", jest.fn());
jest.mock("react-router-dom");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.ResizeObserver = require("resize-observer-polyfill");

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
);

test("populates screen invokables in function context", () => {
  const { result } = renderHook(() => useExecuteCode("myWidget.value"), {
    wrapper,
  });

  let execResult;
  act(() => {
    execResult = result.current?.callback();
  });
  expect(execResult).toBe(2);
});

test("populates context passed in", () => {
  const { result } = renderHook(
    () =>
      useExecuteCode("specialScope.value", {
        context: { specialScope: { value: 4 } },
      }),
    { wrapper },
  );

  let execResult;
  act(() => {
    execResult = result.current?.callback();
  });
  expect(execResult).toBe(4);
});

test("can be invoked multiple times", () => {
  const { result } = renderHook(() => useExecuteCode("myWidget.value"), {
    wrapper,
  });

  let execResult;
  act(() => {
    execResult = result.current?.callback();
  });
  expect(execResult).toBe(2);
  let execResult2;
  act(() => {
    execResult2 = result.current?.callback();
  });
  expect(execResult2).toBe(2);
});

test("call ensemble.invokeAPI", async () => {
  const apiConfig = {
    limit: 15,
    skip: 10,
  };

  const { result } = renderHook(
    () =>
      useExecuteCode(
        "ensemble.invokeAPI('getDummyProductsByPaginate', apiConfig).then((res) => res.body.products.length)",
        { context: { apiConfig } },
      ),
    {
      wrapper,
    },
  );

  let execResult;
  await act(async () => {
    execResult = await result.current?.callback();
  });

  expect(execResult).toBe(apiConfig.limit);
});

test.todo("populates application invokables");

test.todo("resolves values in order of scoping");
