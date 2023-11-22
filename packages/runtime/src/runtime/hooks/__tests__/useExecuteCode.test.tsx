/* eslint import/first: 0 */
import { renderHook } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useExecuteCode } from "../useEnsembleAction";

jest.mock("react-markdown", jest.fn());

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
    screen={{ name: "test", body: { name: "Widget", properties: {} } }}
  >
    {children}
  </ScreenContextProvider>
);

test("populates screen invokables in function context", () => {
  const { result } = renderHook(() => useExecuteCode("myWidget.value"), {
    wrapper,
  });

  const execResult = result.current?.callback();
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

  const execResult = result.current?.callback();
  expect(execResult).toBe(4);
});
test.todo("populates application invokables");

test.todo("resolves values in order of scoping");
