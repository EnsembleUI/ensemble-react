import { useMemo } from "react";
import { type Atom, atom, useAtomValue } from "jotai";
import { isString, map } from "lodash-es";
import { createBindingAtom } from "../evaluate";
import { isExpression, type Expression } from "../shared/common";

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
  const dataAtom = useMemo<Atom<TemplateData>>(() => {
    if (!isDataString) {
      return atom(data);
    }
    if (isExpression(data)) {
      return createBindingAtom(data);
    }
    // Support legacy case where we don't always require curly braces
    return createBindingAtom(`\${${String(data)}}`);
  }, [data, isDataString]);
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
