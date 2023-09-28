import { merge } from "lodash-es";
import type { InvokableMethods, ScreenContextDefinition } from "./state";

export const buildEvaluateFn = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): (() => unknown) => {
  const widgets: [string, InvokableMethods | undefined][] = Object.entries(
    screen.widgets,
  ).map(([id, state]) => {
    const methods = state?.invokable.methods;
    const values = state?.values;
    return [id, merge({}, values, methods)];
  });

  const invokableObj = Object.fromEntries([
    ...widgets,
    ...Object.entries(screen.data),
    ...Object.entries(context ?? {}),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...[...Object.keys(invokableObj)],
    js ? `return ${js}` : "console.log('No expression was given')",
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return () => jsFunc(...Object.values(invokableObj));
};

export const evaluate = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): unknown => {
  try {
    const fn = buildEvaluateFn(screen, js, context);
    return fn();
  } catch (e) {
    return null;
  }
};
