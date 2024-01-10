import { useMemo } from "react";
import { type Atom, atom, useAtomValue } from "jotai";
import { isString, map } from "lodash-es";
import { createBindingAtom } from "../state";
import { isExpression, type Expression } from "../shared/common";
import { useCustomScope } from "./useCustomScope";

export type TemplateData = object | unknown[] | undefined | null;
export interface TemplateDataProps {
  data?: Expression<TemplateData>;
  name?: string;
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
}: TemplateDataProps): {
  rawData: TemplateData;
  namedData: object[];
} => {
  const isDataString = isString(data);
  const scope = useCustomScope();
  const dataAtom = useMemo<Atom<TemplateData>>(() => {
    if (!isDataString) {
      return atom(data);
    }
    if (isExpression(data)) {
      return createBindingAtom(data, scope);
    }
    // Support legacy case where we don't always require curly braces
    return createBindingAtom(`\${${String(data)}}`);
  }, [data, isDataString, scope]);
  const rawData = useAtomValue(dataAtom);
  const namedData = useMemo(
    () => map(rawData, (value: unknown) => ({ [name]: value })),
    [name, rawData],
  );
  return {
    rawData,
    namedData,
  };
};
