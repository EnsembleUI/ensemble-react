import { evaluate } from "../evaluate";
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
test.value.concat(bar)
`,
  );
  expect(result).toEqual("foobar");
});

test("sets values in storage", () => {
  const value = ensembleStore.get(screenAtom);

  evaluate(
    value,
    `
    const value = "foo" + "bar"
    ensemble.storage.set("value", value)
    `,
  );

  const updatedValue = ensembleStore.get(screenAtom);

  expect(updatedValue.storage.value).toEqual("foobar");
});

test("reads back values from storage", () => {
  const value = ensembleStore.get(screenAtom);

  const result = evaluate(
    value,
    `
    const value = "foo" + "baz"
    ensemble.storage.set("value", value)
    ensemble.storage.get("value")
    `,
  );

  expect(result).toEqual("foobaz");
});
