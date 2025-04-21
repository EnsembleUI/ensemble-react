import { useMemo } from "react";
import { atom, useAtomValue } from "jotai";
import type { Expression } from "../shared";
import { deepCloneAsJSON, error, isExpression } from "../shared";
import { createBindingAtom } from "../evaluate";
import { useCustomScope } from "./useCustomScope";

export const useWidgetId = (
  id?: Expression<string>,
  testId?: Expression<string>,
): {
  resolvedWidgetId: string;
  resolvedTestId: string | undefined;
} => {
  const customScope = useCustomScope();

  const idBindingAtom = useMemo(() => {
    if (isExpression(id)) {
      return createBindingAtom(
        id,
        deepCloneAsJSON(customScope) || {},
        "widgetId",
      );
    }
    return atom<string | undefined>(id);
  }, [customScope, id]);

  const resolvedId = useAtomValue(idBindingAtom);

  const resolvedWidgetId = useMemo<string>(() => {
    const workingId = resolvedId;
    if (
      workingId &&
      typeof workingId === "string" &&
      JS_ID_REGEX.test(String(workingId))
    ) {
      return String(workingId);
    }
    if (workingId) {
      error(
        `${String(workingId)} is not a valid javascript identifier. generating a random one`,
      );
    }
    return generateRandomString(6);
  }, [resolvedId]);

  const testIdBindingAtom = useMemo(() => {
    if (isExpression(testId)) {
      return createBindingAtom(
        testId,
        deepCloneAsJSON(customScope) || {},
        "widgetTestId",
      );
    }
    return atom<string | undefined>(testId);
  }, [customScope, testId]);

  const resolvedTestId = useAtomValue(testIdBindingAtom) as string | undefined;

  return { resolvedWidgetId, resolvedTestId };
};

const JS_ID_REGEX = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateRandomString = (length: number): string => {
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
