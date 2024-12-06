import { useMemo, useRef } from "react";
import { type Atom, atom, useAtomValue } from "jotai";
import { isString, map, merge } from "lodash-es";
import isEqual from "react-fast-compare";
import { createBindingAtom } from "../evaluate";
import { isExpression, type Expression } from "../shared/common";
import { useCustomScope } from "./useCustomScope";
import { useEvaluate } from "./useEvaluate";

export type TemplateData = object | unknown[] | undefined | null;
export interface TemplateDataProps {
  data?: Expression<TemplateData>;
  name?: string;
  context?: unknown;
}

/**
 * Utility for evaluating data expressions and templatizing them by a custom
 * name for children widgets. Use in conjunction with {@link useCustomScope}
 *
 * @param data - the expression or raw data to templatize
 * @param name - the name each instance of data should be keyed by
 * @returns
 */

const useDeepCompareMemoize = <T>(value: T) => {
  const ref = useRef<T>();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

export const useTemplateData = ({
  data,
  name = "data",
  context,
}: TemplateDataProps): {
  rawData: TemplateData;
  namedData: object[];
} => {
  const customScope = useCustomScope();
  const isDataString = isString(data);
  const dataAtom = useMemo<Atom<TemplateData>>(() => {
    if (!isDataString) {
      return atom(data);
    }
    if (isExpression(data)) {
      return createBindingAtom(data, merge({}, customScope, context));
    }
    // Support legacy case where we don't always require curly braces
    return createBindingAtom(
      `\${${String(data)}}`,
      merge({}, customScope, context),
    );
  }, [customScope, data, isDataString, context]);
  const rawData = useAtomValue(dataAtom);
  const namedData = useMemo(
    () => map(rawData, (value: unknown) => ({ [name]: value })),
    [name, rawData],
  );
  const evaluated = useEvaluate({ namedData });

  const evaluatedNamedData = useDeepCompareMemoize(evaluated.namedData);

  return {
    rawData,
    namedData: evaluatedNamedData as object[],
  };
};
