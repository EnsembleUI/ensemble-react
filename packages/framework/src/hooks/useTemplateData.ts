import { useMemo } from "react";
import { type Atom, atom, useAtomValue } from "jotai";
import { isString, map, merge } from "lodash-es";
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
  const evaluatedNamedData = useEvaluate({ namedData });

  return {
    rawData,
    namedData: evaluatedNamedData.namedData,
  };
};
