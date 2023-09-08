/* eslint import/first: 0 */
const mockUseEnsembleStore = jest.fn();

import { renderHook } from "@testing-library/react";
import { useEnsembleState } from "../useEnsembleState";

jest.mock("../../state", () => ({
  useEnsembleStore: mockUseEnsembleStore,
}));

const mockInvokable = {
  id: "test",
  methods: {},
};

const mockValues = {
  foo: "bar",
  baz: "deadbeef",
};

test("instantiates state from props", () => {
  mockUseEnsembleStore.mockReturnValue({
    state: {
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

test("updates bindings when incoming values update", () => {
  let mockMutableValues = {
    foo: "bar",
    baz: "deadbeef",
  };
  const mockSetWidget = jest.fn();
  mockUseEnsembleStore.mockReturnValue({
    state: {
      values: mockMutableValues,
    },
    setWidget: mockSetWidget,
  });
  const { result, rerender } = renderHook(() =>
    useEnsembleState(
      mockMutableValues,
      mockInvokable.id,
      mockInvokable.methods,
    ),
  );

  mockMutableValues = {
    foo: "deadbeef",
    baz: "bar",
  };
  mockUseEnsembleStore.mockReturnValue({
    state: {
      values: mockMutableValues,
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
  let mockMutableInvokable = {
    id: "test",
    methods: {},
  };
  const mockSetWidget = jest.fn();
  mockUseEnsembleStore.mockReturnValue({
    state: {
      values: mockValues,
    },
    setWidget: mockSetWidget,
  });
  const { result, rerender } = renderHook(() =>
    useEnsembleState(
      mockValues,
      mockMutableInvokable.id,
      mockMutableInvokable.methods,
    ),
  );

  mockMutableInvokable = {
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
