import { act, renderHook } from "@testing-library/react";
import { evaluate } from "../evaluate/evaluate";
import { useEnsembleStorage } from "../hooks";
import { ensembleStore, screenAtom } from "../state";

const TEST_SCREEN_CONTEXT = {
  widgets: {
    test: {
      invokable: {
        id: "test",
      },
      values: {
        value: "foo",
      },
    },
  },
  data: {},
  storage: {},
};

test("returns values from single line expressions", () => {
  const result = evaluate(TEST_SCREEN_CONTEXT, "test.value");
  expect(result).toEqual("foo");
});

test("returns values from multi line blocks", () => {
  const result = evaluate(
    TEST_SCREEN_CONTEXT,
    `
const bar = "bar"
return test.value.concat(bar)
`,
  );
  expect(result).toEqual("foobar");
});

test("sets values in storage", () => {
  const initialValue = ensembleStore.get(screenAtom);

  // storage hook
  const { result: storageHookResult } = renderHook(() => useEnsembleStorage());
  const storageStore = storageHookResult.current as { [key: string]: unknown };

  act(() => {
    evaluate(
      initialValue,
      `
    const value = "foo" + "bar"
    ensemble.storage.set("value", value)
    `,
      {
        ensemble: { storage: storageStore },
      },
    );
  });

  expect(storageHookResult.current.value).toEqual("foobar");
});

test("reads back values from storage", () => {
  const initialValue = ensembleStore.get(screenAtom);

  // storage hook
  const { result: storageHookResult } = renderHook(() => useEnsembleStorage());
  const storageStore = storageHookResult.current as { [key: string]: unknown };

  let response = "";
  act(() => {
    response = evaluate(
      initialValue,
      `
    const value = "foo" + "baz"
    ensemble.storage.set("value", value)
    return ensemble.storage.get("value")
    `,
      {
        ensemble: { storage: storageStore },
      },
    );
  });

  expect(response).toEqual("foobaz");
});
