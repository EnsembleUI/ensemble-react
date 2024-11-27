import { evaluate } from "../evaluate/evaluate";
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

test("evaluates expressions inside arrays correctly", () => {
  const value = ensembleStore.get(screenAtom);

  const store: Record<string, unknown> = {
    video_type: "mp4",
    image_type: "jpeg",
    image_types: ["jpeg", "png"],
    video_types: ["mp4", "mkv"],
  };

  const simple = evaluate(value, `\${'ensemble-ui'}`);
  const simpleObject = evaluate(value, `\${{ simple: 'ensemble-ui' }}`);
  const simpleInArray = evaluate(value, `\${['ensemble-ui']}`);
  const simpleInMultiArray = evaluate(value, `\${['ensemble', 'ui']}`);

  const math = evaluate(value, `\${3 + 42 + 5}`);
  const mathInObject = evaluate(value, `\${{ math: 3 + 42 + 5 }}`);
  const mathInArray = evaluate(value, `\${[3 + 42 + 5]}`);
  const mathInMultiArray = evaluate(
    value,
    `\${[3 + 42 + 5, 112 + 113 + 125 ]}`,
  );

  const getStorage = (expression: string): void =>
    evaluate(value, expression, {
      ensemble: { storage: createStorageApi(store) },
    });

  const storage = getStorage(`\${ensemble.storage.get("video_type")}`);
  const storageInObject = getStorage(
    `\${{ storage: ensemble.storage.get("video_type") }}`,
  );
  const storageInArray = getStorage(`\${[ensemble.storage.get("video_type")]}`);
  const storageInMultiArray = getStorage(
    `\${[ensemble.storage.get("video_type"), ensemble.storage.get("image_type")]}`,
  );

  const spreadArray = getStorage(
    `\${[...ensemble.storage.get("image_types"), ...ensemble.storage.get("video_types")]}`,
  );

  const multilineJS = getStorage(
    `
    const imagesTypes = ensemble.storage.get('image_types')
    const videoTypes =  ensemble.storage.get('video_types')
    return [...videoTypes, ...imagesTypes]
    `,
  );

  expect(simple).toEqual("ensemble-ui");
  expect(simpleObject).toEqual({ simple: "ensemble-ui" });
  expect(simpleInArray).toEqual(["ensemble-ui"]);
  expect(simpleInMultiArray).toEqual(["ensemble", "ui"]);

  expect(math).toEqual(50);
  expect(mathInObject).toEqual({ math: 50 });
  expect(mathInArray).toEqual([50]);
  expect(mathInMultiArray).toEqual([50, 350]);

  expect(storage).toEqual("mp4");
  expect(storageInObject).toEqual({ storage: "mp4" });
  expect(storageInArray).toEqual(["mp4"]);
  expect(storageInMultiArray).toEqual(["mp4", "jpeg"]);

  expect(spreadArray).toEqual(["jpeg", "png", "mp4", "mkv"]);

  expect(multilineJS).toEqual(["mp4", "mkv", "jpeg", "png"]);
});
