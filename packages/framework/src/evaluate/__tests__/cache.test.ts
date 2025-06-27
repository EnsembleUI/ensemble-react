import { buildEvaluateFn, testGetScriptCacheSize } from "../evaluate";
import type { ScreenContextDefinition } from "../../state";

const importScript = `function shared(x){return x+1}; const sharedConst=42;`;
const globalScript1 = `const unique=10; function calc(){return shared(unique)+sharedConst}`;
const globalScript2 = `const unique=20; function calc(){return shared(unique)+sharedConst}`;

// construct a minimal ScreenContextDefinition subset that buildEvaluateFn expects
const makeScreen = (global: string): Partial<ScreenContextDefinition> => ({
  model: {
    id: "test",
    name: "test",
    body: { name: "Row", properties: {} },
    importedScripts: importScript,
    global,
  },
});

it("caches import script only once across multiple screens", () => {
  const before = testGetScriptCacheSize();

  const fn1 = buildEvaluateFn(makeScreen(globalScript1), "calc()");
  fn1();

  const fn2 = buildEvaluateFn(makeScreen(globalScript2), "calc()");
  fn2();

  const after = testGetScriptCacheSize();

  // cache should have grown by exactly 3 entries: 1 import + 2 globals
  expect(after - before).toBe(3);

  // validating evaluated results
  expect(fn1() as number).toBe(53); // 10 + 1 + 42
  expect(fn2() as number).toBe(63); // 20 + 1 + 42
});
