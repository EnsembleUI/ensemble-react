import { useCallback } from "react";
import { merge } from "lodash-es";
import { useAtomValue } from "jotai";
import type { InvokableMethods } from "../state";
import { screenAtom } from "../state";

export const useActionCallback = (
  js?: string,
  context?: Record<string, unknown>,
): (() => unknown) => {
  const screen = useAtomValue(screenAtom);

  const widgets: [string, InvokableMethods | undefined][] = Object.entries(
    screen.widgets,
  ).map(([id, state]) => {
    const methods = state?.invokable.methods;
    const values = state?.values;
    return [id, merge({}, values, methods)];
  });

  const invokableObj = Object.fromEntries([
    ...widgets,
    ...Object.entries(context ?? {}),
  ]);
  invokableObj.data = screen.data;

  const execute = useCallback((): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const jsFunc = new Function(
      ...[...Object.keys(invokableObj)],
      js ? `return ${js}` : "console.log('No expression was given')",
    );
    return jsFunc(...Object.values(invokableObj));
  }, [invokableObj, js]);
  return execute;
};
