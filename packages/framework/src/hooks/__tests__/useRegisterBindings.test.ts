/* eslint import/first: 0 */
import { renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { useRegisterBindings } from "../useRegisterBindings";
import { screenAtom } from "../../state";
import { screenStorageAtom } from "../useEnsembleStorage";

const mockInvokable = {
  id: "test",
  methods: {},
};

const mockValues = {
  foo: "bar",
  baz: "deadbeef",
};

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
