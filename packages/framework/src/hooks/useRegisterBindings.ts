import type { RefCallback } from "react";
import { useEffect, useMemo } from "react";
import { compact, get, isEmpty, isString, merge, set } from "lodash-es";
import isEqual from "react-fast-compare";
import { atom, useAtom } from "jotai";
import type { InvokableMethods } from "../state";
import { createBindingAtom } from "../state";
import { findExpressions } from "../shared";
import { useWidgetId } from "./useWidgetId";
import { useHtmlPassThrough } from "./useHtmlPassThrough";
import { useCustomScope } from "./useCustomScope";
import { useWidgetState } from "./useWidgetState";
import { useStyleNames } from "./useStyleNames";

export interface RegisterBindingsResult<T> {
  id: string;
  values?: T;
  rootRef: RefCallback<never>;
}

export const useRegisterBindings = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): RegisterBindingsResult<T> => {
  const testId = get(values, ["testId"]);

  const { resolvedWidgetId, resolvedTestId } = useWidgetId(
    id,
    isString(testId) ? String(testId) : undefined,
  );

  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);
  const styleNames = get(values, ["styles", "names"]) as unknown;
  const styleProperties = useStyleNames(
    isString(styleNames) ? String(styleNames) : "",
  );

  const styles = merge({}, styleProperties, values?.styles);
  if (!isEmpty(styles)) {
    merge(values, { styles });
  }

  const expressions = useMemo(() => {
    const expressionMap: string[][] = [];
    findExpressions(values, [], expressionMap);
    return expressionMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customScope = useCustomScope();

  const bindingsAtom = useMemo(() => {
    const bindingsEntries = compact(
      expressions.map(([name, expr]) => {
        const valueAtom = createBindingAtom(
          expr,
          customScope,
          resolvedWidgetId,
        );
        return { name, valueAtom };
      }),
    );
    return atom((getAtom) => {
      const valueEntries: [string, unknown][] = bindingsEntries.map(
        ({ name, valueAtom }) => {
          return [name, getAtom(valueAtom)];
        },
      );
      const result = {};
      valueEntries.forEach(([name, value]) => set(result, name, value));
      return result;
    });
  }, [customScope, expressions, resolvedWidgetId]);

  const [bindings] = useAtom(bindingsAtom);

  const newValues = merge({}, values, bindings) as T;
  useEffect(() => {
    // Improves performance greatly: o need to store state in global if there's no explicit ID to reference it with
    if (isEmpty(id)) {
      return;
    }

    if (
      isEqual(newValues, widgetState?.values) &&
      isEqual(methods, widgetState?.invokable.methods)
    ) {
      return;
    }

    setWidgetState({
      values: newValues,
      invokable: { id: resolvedWidgetId, methods },
    });
  }, [
    methods,
    resolvedWidgetId,
    setWidgetState,
    newValues,
    widgetState?.values,
    widgetState?.invokable.methods,
    id,
  ]);

  const updatedValues = widgetState?.values ?? newValues;
  const htmlAttributes = get(updatedValues, "htmlAttributes") as Record<
    string,
    string
  >;

  const { rootRef } = useHtmlPassThrough(
    id ? resolvedWidgetId : resolvedTestId ?? "",
    htmlAttributes,
  );

  return {
    id: resolvedWidgetId,
    values: updatedValues,
    rootRef,
  };
};
