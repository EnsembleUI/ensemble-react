import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { isString, map } from "lodash-es";
import isEqual from "react-fast-compare";
import { selectAtom } from "jotai/utils";
import type { ScreenContextDefinition } from "../state";
import { screenAtom } from "../state/screen";
import { evaluate } from "../evaluate";
import type { Expression } from "../shared/common";
import { createStorageApi } from "./useEnsembleStorage";

export type TemplateData = object | unknown[] | undefined;
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
  const isExpression = isString(data);
  const dataAtom = useMemo(
    () =>
      selectAtom<ScreenContextDefinition, TemplateData>(
        screenAtom,
        (screenContext: ScreenContextDefinition) => {
          if (!isExpression) {
            return data;
          }
          try {
            return evaluate(screenContext, String(data), {
              ensemble: {
                storage: createStorageApi(screenContext.storage),
              },
            });
          } catch (e) {
            return {};
          }
        },
        isEqual,
      ),
    [data, isExpression],
  );
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
