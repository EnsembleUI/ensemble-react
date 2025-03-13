/* eslint import/first: 0 */
import { act, renderHook } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useExecuteCode } from "../useEnsembleAction";

jest.mock("react-markdown", jest.fn());
jest.mock("react-router-dom");

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
        {
          name: "getMeowFact",
          method: "GET",
          uri: "https://meowfacts.herokuapp.com/",
          cacheExpirySeconds: 120,
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

test("call ensemble.invokeAPI with bypassCache", async () => {
  const { result: withoutForce } = renderHook(
    () =>
      useExecuteCode(
        "ensemble.invokeAPI('getMeowFact', null).then((res) => res.body.data[0])",
      ),
    { wrapper },
  );

  const { result: withForce } = renderHook(
    () =>
      useExecuteCode(
        "ensemble.invokeAPI('getMeowFact', null, { bypassCache: true }).then((res) => res.body.data[0])",
      ),
    { wrapper },
  );

  let withoutForceInitialResult;
  let withoutForceResult;
  let withForceResult;

  await act(async () => {
    withoutForceInitialResult = await withoutForce.current?.callback();
    withoutForceResult = await withoutForce.current?.callback();
    withForceResult = await withForce.current?.callback();
  });

  expect(withoutForceInitialResult).toBe(withoutForceResult);
  expect(withForceResult).not.toBe(withoutForceResult);
});

test.todo("populates application invokables");

test.todo("resolves values in order of scoping");
