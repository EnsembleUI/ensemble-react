import { renderHook } from "@testing-library/react";
import { useWidgetId } from "../useWidgetId";

test("returns a uuid without dashes", () => {
  const { result } = renderHook(() => useWidgetId());
  expect(result.current).toMatch(/^[a-zA-Z]*$/);
});

test("returns a passed in id", () => {
  const { result } = renderHook(() => useWidgetId("test"));
  expect(result.current).toMatch("test");
});

test.todo("throws an error if the id is already in use");
