import { renderHook } from "@testing-library/react";
import { useWidgetId } from "../useWidgetId";

test("generates a valid ID when no ID is provided", () => {
  const { result } = renderHook(() => useWidgetId());
  expect(result.current.resolvedWidgetId).toMatch(/^[a-zA-Z]+$/);
  expect(result.current.resolvedTestId).toBeUndefined();
});

test("uses the provided ID when valid", () => {
  const { result } = renderHook(() => useWidgetId("validId"));
  expect(result.current.resolvedWidgetId).toBe("validId");
});

test("generates a random ID when provided ID is invalid", () => {
  const { result } = renderHook(() => useWidgetId("123 invalid"));
  expect(result.current.resolvedWidgetId).not.toBe("123 invalid");
});

test("preserves test ID when provided", () => {
  const { result } = renderHook(() => useWidgetId("validId", "test-123"));
  expect(result.current.resolvedWidgetId).toBe("validId");
  expect(result.current.resolvedTestId).toBe("test-123");
});
