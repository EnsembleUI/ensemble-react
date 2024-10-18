import type { RefCallback } from "react";
import { useEffect, useMemo, useRef } from "react";
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
  return func1?.toString() === func2?.toString();
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
  const prevMethodsRef = useRef(methods);

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

    const prevStateCheck = keys(methods).every((methodKey: string) => {
      const fromMethods = get(methods, methodKey);
      const fromWidgets = get(widgetState?.invokable?.methods, methodKey);
      const prevMethod = get(prevMethodsRef.current, methodKey);

      // Check if the current method is different from the previous one
      if (!areFunctionsEqual(fromMethods, prevMethod)) {
        return false;
      }

      // If it's the same as the previous, check against the widget state
      return areFunctionsEqual(fromMethods, fromWidgets);
    });

    if (
      (options?.comparator
        ? options.comparator(newValues, widgetState?.values)
        : isEqual(newValues, widgetState?.values)) &&
      prevStateCheck
    ) {
      return;
    }

    debounceSetState({
      values: newValues,
      invokable: { id: resolvedWidgetId, methods },
    });

    // Update the previous methods reference
    prevMethodsRef.current = methods;
  }, [
    methods,
    resolvedWidgetId,
    setWidgetState,
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
  }, [options?.forceState]);

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
