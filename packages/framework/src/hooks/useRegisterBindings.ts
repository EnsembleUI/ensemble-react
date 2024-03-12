import type { RefCallback } from "react";
import { useEffect } from "react";
import { get, isEmpty, isString, merge } from "lodash-es";
import isEqual from "react-fast-compare";
import type { InvokableMethods } from "../state";
import { useWidgetId } from "./useWidgetId";
import { useHtmlPassThrough } from "./useHtmlPassThrough";
import { useWidgetState } from "./useWidgetState";
import { useStyleNames } from "./useStyleNames";
import { useEvaluate } from "./useEvaluate";

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

  const namedStyles = get(values, ["styles", "names"]) as unknown;
  const classStyles = get(values, ["styles", "className"]) as unknown;

  const styleProperties = useStyleNames(
    isString(namedStyles) ? namedStyles : "",
    isString(classStyles) ? classStyles : "",
  );

  const styles = merge({}, styleProperties, values.styles);
  if (!isEmpty(styles)) {
    merge(values, { styles });
  }

  const newValues = useEvaluate(values, { debugId: resolvedWidgetId });

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
    htmlAttributes,
    id ? resolvedWidgetId : resolvedTestId ?? "",
  );

  return {
    id: resolvedWidgetId,
    values: updatedValues,
    rootRef,
  };
};
