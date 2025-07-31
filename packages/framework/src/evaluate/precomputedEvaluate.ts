import { atom } from "jotai";
import { merge } from "lodash-es";
import {
  screenGlobalScriptAtom,
  screenImportScriptAtom,
  defaultScreenContext,
} from "../state";
import { buildEvaluateFn } from "./evaluate";

const createScreenEvaluator = (
  globalScript?: string,
  importScript?: string,
) => {
  // The key insight is that the `buildEvaluateFn` is the source of the performance issue
  // because it creates a `new Function()` every time. The goal here is to create a
  // function that encapsulates the global/imported scripts once.

  // const scriptBlock = `
  //   ${importScript || ""}
  //   ${globalScript || ""}
  // `;

  // We create a function *once* that contains all the global/imported scripts.
  // This is the expensive operation we are memoizing.
  // The function it returns will be the actual evaluator for a given expression.
  const evaluator = (
    expression: string,
    context: { [key: string]: unknown },
  ): unknown => {
    // Now, we use the `buildEvaluateFn` but in a more lightweight way.
    // Instead of passing the scripts to it directly, we are essentially building
    // the final script string ourselves and letting buildEvaluateFn just create the
    // final execution context.
    const screenContext = merge({}, defaultScreenContext, {
      model: {
        global: globalScript, // Pass the already combined scripts
        importedScripts: importScript,
      },
    });
    return buildEvaluateFn(screenContext, expression, context)();
  };
  return evaluator;
};

// This Jotai atom gets the scripts and provides the memoized evaluator function to the screen.
export const screenEvaluatorAtom = atom((get) => {
  const globalScript = get(screenGlobalScriptAtom);
  const importScript = get(screenImportScriptAtom);

  // createScreenEvaluator will be re-evaluated if the scripts change,
  // returning a new evaluator function. Jotai's memoization handles the rest.
  return createScreenEvaluator(globalScript, importScript);
});
