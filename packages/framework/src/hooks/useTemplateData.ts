import { useEffect, useMemo, useState } from "react";
import { type Atom, atom, useAtomValue } from "jotai";
import { isString, map, merge } from "lodash-es";
import isEqual from "react-fast-compare";
import { createBindingAtom } from "../evaluate";
import { isExpression, type Expression } from "../shared/common";
import { useCustomScope } from "./useCustomScope";

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
  const [namedData, setNamedData] = useState<{ [key: string]: unknown }[]>([]);
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

  useEffect(() => {
    const tempData = map(rawData, (value: unknown) => ({ [name]: value }));
    if (isEqual(tempData, namedData)) {
      return;
    }

    setNamedData(tempData);
  }, [name, rawData, namedData]);

  return {
    rawData,
    namedData,
  };
};
