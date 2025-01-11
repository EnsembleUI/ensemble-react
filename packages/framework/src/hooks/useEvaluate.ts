import { useMemo } from "react";
import { atom, useAtom } from "jotai";
import { compact, get, merge, set } from "lodash-es";
import { useTranslation } from "react-i18next";
import { findExpressions, findHexCodes, findTranslationKeys } from "../shared";
import { createBindingAtom } from "../evaluate";
import { useCustomScope } from "./useCustomScope";

export const useEvaluate = <T extends { [key: string]: unknown }>(
  values?: T,
  options?: {
    context?: unknown;
    debugId?: string;
    refreshExpressions?: boolean;
  },
): T => {
  const customScope = useCustomScope();
  const { t: translate } = useTranslation();

  const expressions = useMemo(
    () => {
      const expressionMap: string[][] = [];
      findExpressions(values, [], expressionMap);
      return expressionMap;
    },
    options?.refreshExpressions ? [values] : [values?.styles], // values.styles can change when there are expressions in class names,
  );

  const bindingsAtom = useMemo(() => {
    const bindingsEntries = compact(
      expressions.map(([name, expr]) => {
        const valueAtom = createBindingAtom(
          expr,
          {
            ...customScope,
            ...(options?.context as { [key: string]: unknown }),
          },
          options?.debugId,
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
  }, [expressions, customScope, options?.context, options?.debugId]);

  const [bindings] = useAtom(bindingsAtom);

  // evaluate language translations
  const translatedkeys = useMemo(() => {
    const translationMap: string[][] = [];
    findTranslationKeys(values, [], translationMap);

    const result = {};
    translationMap.forEach(([name, translateKey]) => {
      set(result, name, translate(translateKey));
    });

    return result;
  }, [values, translate]);

  const updatedValues = merge({}, values, bindings, translatedkeys);

  // evaluate flutter color hex codes
  const hexCodes = useMemo(() => {
    const hexCodesMaps: string[][] = [];
    findHexCodes(
      get(updatedValues, "styles") as { [key: string]: unknown },
      [],
      hexCodesMaps,
    );

    const result = {};
    hexCodesMaps.forEach(([name, value]) => {
      set(result, `styles.${name}`, value);
    });

    return result;
  }, [updatedValues]);

  return merge({}, updatedValues, hexCodes);
};
