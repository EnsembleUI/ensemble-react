/* eslint import/first: 0 */
import { renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { useExecuteCode } from "../useExecuteCode";
import { screenAtom } from "../../state";

test("populates screen invokables in function context", () => {
  const store = getDefaultStore();
  store.set(screenAtom, {
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
  });
  const { result } = renderHook(() => useExecuteCode("myWidget.value"));

  const execResult = result.current();
  expect(execResult).toBe(2);
});

test("populates context passed in", () => {
  const { result } = renderHook(() =>
    useExecuteCode("specialScope.value", { specialScope: { value: 4 } }),
  );

  const execResult = result.current();
  expect(execResult).toBe(4);
});
test.todo("populates application invokables");

test.todo("resolves values in order of scoping");
