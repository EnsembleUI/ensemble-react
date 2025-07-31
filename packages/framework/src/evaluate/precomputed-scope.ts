import { atom } from "jotai";
import * as acorn from "acorn";
// @ts-expect-error - acorn-walk is not typed
import { simple as simpleWalk } from "acorn-walk";
import {
  screenGlobalScriptAtom,
  screenImportScriptAtom,
} from "../state";
import { debug } from "../shared";

/**
 * This atom is responsible for the core performance optimization.
 * It does the following:
 * 1. Takes the raw string content of all global and imported scripts for a screen.
 * 2. Parses these scripts into an Abstract Syntax Tree (AST) using acorn.
 * 3. Walks the AST to find the names of all declared functions (e.g., function myFunc() {} or const myFunc = () => {}).
 * 4. It then constructs and executes a new Function() **ONCE**. This function's body contains all the scripts, and it returns an object containing the functions that were found.
 * 5. The result is a simple JavaScript object like { myFunc: [Function: myFunc] }, which is the pre-computed "scope".
 *
 * Jotai memoizes the result of this atom, so this entire expensive process runs only
 * one time when a screen loads, not for every binding.
 */
export const screenScopeAtom = atom((get) => {
  const globalScript = get(screenGlobalScriptAtom);
  const importScript = get(screenImportScriptAtom);

  if (!globalScript && !importScript) {
    return {};
  }

  const allScripts = `${importScript || ""}
${globalScript || ""}`;
  const functionNames: string[] = [];

  try {
    const ast = acorn.parse(allScripts, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    simpleWalk(ast, {
      FunctionDeclaration(node: any) {
        if (node.id) {
          functionNames.push(node.id.name);
        }
      },
      VariableDeclaration(node: any) {
        for (const declaration of node.declarations) {
          if (
            declaration.id.type === "Identifier" &&
            declaration.init &&
            (declaration.init.type === "ArrowFunctionExpression" ||
              declaration.init.type === "FunctionExpression")
          ) {
            functionNames.push(declaration.id.name);
          }
        }
      },
    });

    const uniqueFunctionNames = [...new Set(functionNames)];
    if (uniqueFunctionNames.length === 0) {
      return {};
    }

    const scriptToExecute = `
      ${allScripts}
      return { ${uniqueFunctionNames.join(", ")} };
    `;

    // This is the one-time expensive operation that creates the scope
    const scopeFactory = new Function(scriptToExecute);
    const scope = scopeFactory();
    debug("Pre-computed global scope for screen:", scope);
    return scope;
  } catch (e) {
    debug("Error parsing global scripts to create pre-computed scope:", e);
    // In case of a syntax error in the user's script, return an empty
    // scope to prevent the entire app from crashing.
    return {};
  }
});
