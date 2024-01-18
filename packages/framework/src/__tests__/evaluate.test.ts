import { evaluate } from "../evaluate";
import { createStorageApi } from "../hooks";
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
  const value = ensembleStore.get(screenAtom);
  const store: Record<string, unknown> = {};

  evaluate(
    value,
    `
    const value = "foo" + "bar"
    ensemble.storage.set("value", value)
    `,
    {
      ensemble: { storage: createStorageApi(store) },
    },
  );

  expect(store.value).toEqual("foobar");
});

test("reads back values from storage", () => {
  const value = ensembleStore.get(screenAtom);
  const store: Record<string, unknown> = {};

  const result = evaluate(
    value,
    `
    const value = "foo" + "baz"
    ensemble.storage.set("value", value)
    return ensemble.storage.get("value")
    `,
    {
      ensemble: { storage: createStorageApi(store) },
    },
  );

  expect(result).toEqual("foobaz");
});
