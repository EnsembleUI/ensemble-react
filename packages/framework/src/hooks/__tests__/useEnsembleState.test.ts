/* eslint import/first: 0 */
const mockUseEnsembleStore = jest.fn();

import { renderHook } from "@testing-library/react";
import { useEnsembleState } from "../useEnsembleState";

jest.mock("../../state", () => ({
  useEnsembleStore: mockUseEnsembleStore,
}));

test("instantiates state from props", () => {
  const mockInvokable = {
    id: "test",
    methods: {},
  };
  const mockValues = {
    foo: "bar",
    baz: "deadbeef",
  };
  mockUseEnsembleStore.mockReturnValue({
    bindings: {
      values: mockValues,
    },
    setWidget: jest.fn(),
  });
  const { result } = renderHook(() =>
    useEnsembleState(mockValues, mockInvokable.id, mockInvokable.methods),
  );

  expect(mockUseEnsembleStore).toBeCalledTimes(1);
  expect(result.current).toEqual({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
    },
  });
});

test("updates bindings when values update", () => {
  const mockInvokable = {
    id: "test",
    methods: {},
  };
  let mockValues = {
    foo: "bar",
    baz: "deadbeef",
  };
  const mockSetWidget = jest.fn();
  mockUseEnsembleStore.mockReturnValue({
    bindings: {
      values: mockValues,
    },
    setWidget: mockSetWidget,
  });
  const { result, rerender } = renderHook(() =>
    useEnsembleState(mockValues, mockInvokable.id, mockInvokable.methods),
  );

  mockValues = {
    foo: "deadbeef",
    baz: "bar",
  };
  mockUseEnsembleStore.mockReturnValue({
    bindings: {
      values: mockValues,
    },
    setWidget: mockSetWidget,
  });
  rerender();

  expect(mockSetWidget).toBeCalledTimes(2);
  expect(result.current).toEqual({
    id: "test",
    values: {
      foo: "deadbeef",
      baz: "bar",
    },
  });
});

test("updates bindings when invokable updates", () => {
  let mockInvokable = {
    id: "test",
    methods: {},
  };
  const mockValues = {
    foo: "bar",
    baz: "deadbeef",
  };
  const mockSetWidget = jest.fn();
  mockUseEnsembleStore.mockReturnValue({
    bindings: {
      values: mockValues,
    },
    setWidget: mockSetWidget,
  });
  const { result, rerender } = renderHook(() =>
    useEnsembleState(mockValues, mockInvokable.id, mockInvokable.methods),
  );

  mockInvokable = {
    id: "test2",
    methods: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setter: (): void => {},
    },
  };
  rerender();

  expect(mockSetWidget).toBeCalledTimes(2);
  expect(result.current.values).toEqual(mockValues);
});
