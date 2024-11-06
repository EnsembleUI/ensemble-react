import type { RefCallback } from "react";
import { useEffect, useMemo } from "react";
import { get, isEmpty, isString, keys, debounce } from "lodash-es";
import isEqual from "react-fast-compare";
import type { InvokableMethods } from "../state";
import { useWidgetId } from "./useWidgetId";
import { useHtmlPassThrough } from "./useHtmlPassThrough";
import { useWidgetState } from "./useWidgetState";
import { useStyles } from "./useStyles";
import { useEvaluate } from "./useEvaluate";

export interface RegisterBindingsResult<T> {
  id: string;
  values?: T;
  rootRef: RefCallback<never>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
const areFunctionsEqual = (func1?: Function, func2?: Function): boolean => {
  return func1 === func2;
};

const areValuesAndMethodsEqual = <T>(
  newValues: T,
  prevValues: T | undefined,
  methods: InvokableMethods | undefined,
  prevMethods: InvokableMethods | undefined,
  comparator?: (next: T, prev?: T) => boolean,
): boolean => {
  // Check values equality
  const areValuesEqual = comparator
    ? comparator(newValues, prevValues)
    : isEqual(newValues, prevValues);

  if (!areValuesEqual) return false;

  // Check methods equality
  if (!methods) return true;

  return keys(methods).every((methodKey: string) => {
    const fromMethods = get(methods, methodKey);
    const fromWidgets = get(prevMethods, methodKey);
    return areFunctionsEqual(fromMethods, fromWidgets);
  });
};

export const useRegisterBindings = <T extends { [key: string]: unknown }>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
  options?: {
    forceState?: boolean;
    debounceMs?: number;
    comparator?: (next: T, prev?: T) => boolean;
  },
): RegisterBindingsResult<T> => {
  const testId = get(values, ["testId"]);

  const { resolvedWidgetId, resolvedTestId } = useWidgetId(
    id,
    isString(testId) ? String(testId) : undefined,
  );

  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);

  const styles = useStyles(values);

  const newValues = useEvaluate(
    { ...values, ...(isEmpty(styles) ? {} : { styles }) },
    {
      debugId: resolvedWidgetId,
    },
  );

  const debounceSetState = useMemo(
    () => debounce(setWidgetState, options?.debounceMs ?? 0, { leading: true }),
    [options?.debounceMs, setWidgetState],
  );

  useEffect(() => {
    // Improves performance greatly: o need to store state in global if there's no explicit ID to reference it with
    if (isEmpty(id)) {
      return;
    }

    if (
      areValuesAndMethodsEqual(
        newValues,
        widgetState?.values,
        methods,
        widgetState?.invokable?.methods,
        options?.comparator,
      )
    ) {
      return;
    }

    debounceSetState({
      values: newValues,
      invokable: { id: resolvedWidgetId, methods },
    });
  }, [
    methods,
    resolvedWidgetId,
    newValues,
    widgetState?.values,
    widgetState?.invokable?.methods,
    id,
    debounceSetState,
    options,
  ]);

  useEffect(() => {
    if (options?.forceState === true) {
      setWidgetState({
        values: newValues,
        invokable: { id: resolvedWidgetId, methods },
      });
    }
  }, [
    options?.forceState,
    newValues,
    resolvedWidgetId,
    methods,
    setWidgetState,
  ]);

  const updatedValues = widgetState?.values ?? newValues;
  const htmlAttributes = get(updatedValues, "htmlAttributes") as {
    [key: string]: string;
  };

  const { rootRef } = useHtmlPassThrough(
    htmlAttributes,
    id ? resolvedWidgetId : resolvedTestId ?? "",
  );

  return {
    id: resolvedWidgetId,
    values: updatedValues,
    rootRef,
  };
};
