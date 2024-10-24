/* eslint import/first: 0 */
import { renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { useRegisterBindings } from "../useRegisterBindings";
import { screenAtom } from "../../state";
import { screenStorageAtom } from "../useEnsembleStorage";
import { useCallback } from "react";

const mockInvokable = {
  id: "test",
  methods: {},
};

const mockValues = {
  foo: "bar",
  baz: "deadbeef",
};

// Define the type for the object with callback functions
type CallbacksObject = {
  sum: () => number;
  minus: () => number;
  multiply: () => number;
  divide: () => number;
};

const generateObjectWithCallbacks = (dependency: number): CallbacksObject => ({
  sum: (): number => dependency + 2,
  minus: (): number => dependency - 2,
  multiply: (): number => dependency * 2,
  divide: (): number => dependency / 2,
});

const store = getDefaultStore();

test("instantiates state from props", () => {
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
    storage: {},
  });
  const { result } = renderHook(() =>
    useRegisterBindings(mockValues, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
    },
  });
});

test("evaluates nested bindings", () => {
  store.set(screenStorageAtom, {
    paddingValue: 2,
  });
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
  });

  const mockData = {
    ...mockValues,
    // eslint-disable-next-line no-template-curly-in-string
    styles: { padding: "${ensemble.storage.get('paddingValue')}" },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
      styles: {
        padding: 2,
      },
    },
  });
});

test("evaluates nested bindings 2", () => {
  store.set(screenStorageAtom, {
    paddingValue: 2,
  });
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
  });

  const mockData = {
    ...mockValues,
    styles: {
      padding:
        // eslint-disable-next-line no-template-curly-in-string
        "${ensemble.storage.get('paddingValue')} ${ensemble.storage.get('paddingValue')}",
    },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
      styles: {
        padding: "2 2",
      },
    },
  });
});

test("evaluates multiple bindings within a single string", () => {
  store.set(screenStorageAtom, {
    paddingValue: 2,
    marginValue: 5,
  });
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
  });

  const mockData = {
    ...mockValues,
    styles: {
      padding:
        // eslint-disable-next-line no-template-curly-in-string
        "${ensemble.storage.get('paddingValue')} ${ensemble.storage.get('marginValue')}",
    },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
      styles: {
        padding: "2 5",
      },
    },
  });
});

test("evaluates bindings with text surrounding the placeholders", () => {
  store.set(screenStorageAtom, {
    paddingValue: 2,
  });
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
  });

  const mockData = {
    ...mockValues,
    styles: {
      padding:
        // eslint-disable-next-line no-template-curly-in-string
        "Padding value: ${ensemble.storage.get('paddingValue')}",
    },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      foo: "bar",
      baz: "deadbeef",
      styles: {
        padding: "Padding value: 2",
      },
    },
  });
});

test("updates bindings when incoming values update", () => {
  let mockMutableValues = {
    foo: "bar",
    baz: "deadbeef",
  };
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockMutableValues,
        invokable: mockInvokable,
      },
    },
    data: {},
    storage: {},
  });
  const { result, rerender } = renderHook(() =>
    useRegisterBindings(
      mockMutableValues,
      mockInvokable.id,
      mockInvokable.methods,
    ),
  );

  mockMutableValues = {
    foo: "deadbeef",
    baz: "bar",
  };
  rerender();

  expect(result.current).toMatchObject({
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
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockMutableInvokable,
      },
    },
    data: {},
    storage: {},
  });
  const { result, rerender } = renderHook(() =>
    useRegisterBindings(
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

  const updatedScreen = store.get(screenAtom);
  expect(result.current.values).toEqual(mockValues);
  expect(updatedScreen.widgets.test?.invokable?.methods?.setter).not.toBeNull();
});

test("evaluates flutter style hex codes ", () => {
  const mockData = {
    styles: { color: "0xffb74093" },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      styles: {
        color: "rgba(183, 64, 147, 1.00)",
      },
    },
  });
});

test("evaluates flutter style hex codes expressions", () => {
  store.set(screenStorageAtom, {
    flutterColorCode: "0xffb74093",
  });
  store.set(screenAtom, {
    widgets: {
      test: {
        values: mockValues,
        invokable: mockInvokable,
      },
    },
    data: {},
  });

  const mockData = {
    ...mockValues,
    // eslint-disable-next-line no-template-curly-in-string
    styles: { color: "${ensemble.storage.get('flutterColorCode')}" },
  };

  const { result } = renderHook(() =>
    useRegisterBindings(mockData, mockInvokable.id, mockInvokable.methods),
  );

  expect(result.current).toMatchObject({
    id: "test",
    values: {
      styles: {
        color: "rgba(183, 64, 147, 1.00)",
      },
    },
  });
});

test.only("should keep the same callback reference when dependencies do not change", () => {
  const { result, rerender } = renderHook(
    ({ dependency }) =>
      useCallback(() => {
        return dependency * 2;
      }, [dependency]),
    {
      initialProps: { dependency: 1 },
    },
  );

  const firstCallback = result.current;
  expect(firstCallback()).toBe(2);

  // Rerender with the same dependency
  rerender({ dependency: 1 });

  const secondCallback = result.current;

  // Check that the callback reference remains the same
  expect(firstCallback.toString()).toBe(secondCallback.toString());
});

test("should keep the same reference for all functions inside an object when dependencies do not change", () => {
  const { result, rerender } = renderHook(
    ({ dependency }) =>
      useCallback(() => generateObjectWithCallbacks(dependency), [dependency]),
    {
      initialProps: { dependency: 1 },
    },
  );

  const firstObject = result.current();
  const {
    sum: firstSum,
    minus: firstMinus,
    multiply: firstMultiply,
    divide: firstDivide,
  } = firstObject;

  expect(firstSum()).toBe(3);
  expect(firstMinus()).toBe(-1);
  expect(firstMultiply()).toBe(2);
  expect(firstDivide()).toBe(0.5);

  // Rerender with the same dependency
  rerender({ dependency: 1 });

  const secondObject = result.current();
  const {
    sum: secondSum,
    minus: secondMinus,
    multiply: secondMultiply,
    divide: secondDivide,
  } = secondObject;

  // Check that the reference for all functions inside the object remains the same
  expect(secondSum.toString()).toEqual(firstSum.toString());
  expect(firstMinus.toString()).toBe(secondMinus.toString());
  expect(firstMultiply.toString()).toBe(secondMultiply.toString());
  expect(firstDivide.toString()).toBe(secondDivide.toString());
});
