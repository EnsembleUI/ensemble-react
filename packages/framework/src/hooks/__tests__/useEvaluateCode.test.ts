/* eslint import/first: 0 */
const mockStore = jest.fn();

import { renderHook } from "@testing-library/react";
import { useEvaluate } from "../useEvaluateCode";

jest.mock("../../state", () => ({
  useEnsembleStore: mockStore,
}));

test("populates screen invokables in function context", () => {
  mockStore.mockReturnValue({
    screen: {
      widgets: {
        myWidget: {
          values: {
            value: 2,
          },
          invokable: {},
        },
      },
    },
  });
  const { result } = renderHook(() => useEvaluate("myWidget.value"));

  const execResult = result.current();
  expect(execResult).toBe(2);
});

test("populates context passed in", () => {
  const { result } = renderHook(() =>
    useEvaluate("specialScope.value", { specialScope: { value: 4 } }),
  );

  const execResult = result.current();
  expect(execResult).toBe(4);
});
test.todo("populates application invokables");

test.todo("resolves values in order of scoping");
