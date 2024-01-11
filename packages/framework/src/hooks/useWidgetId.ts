import { useMemo } from "react";
import type { Expression } from "../shared";
import { error, isExpression } from "../shared";
import { evaluate } from "../evaluate";
import { defaultScreenContext } from "../state";
import { useCustomScope } from "./useCustomScope";

export const useWidgetId = (
  id?: Expression<string>,
  testId?: Expression<string>,
): {
  resolvedWidgetId: string;
  resolvedTestId: string;
} => {
  const customScope = useCustomScope();
  const resolvedWidgetId = useMemo<string>(() => {
    let workingId = id;
    if (isExpression(workingId)) {
      workingId = String(
        evaluate(defaultScreenContext, workingId, customScope),
      );
    }
    if (workingId && JS_ID_REGEX.test(workingId)) {
      return workingId;
    }
    if (workingId) {
      error(
        `${workingId} is not a valid javascript identifier. generating a random one`,
      );
    }
    return generateRandomString(6);
  }, [customScope, id]);

  const resolvedTestId = useMemo(() => {
    if (isExpression(testId)) {
      return String(evaluate(defaultScreenContext, testId, customScope));
    }
    return testId;
  }, [customScope, testId]);

  return { resolvedWidgetId, resolvedTestId };
};

const JS_ID_REGEX = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateRandomString = (length: number): string => {
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
