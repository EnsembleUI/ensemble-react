import { useCallback } from "react";
import { useAtomValue } from "jotai";
import { screenAtom } from "../state";
import { evaluate } from "../evaluate";

export const useExecuteCode = (
  js?: string,
  context?: Record<string, unknown>,
): (() => unknown) => {
  const screen = useAtomValue(screenAtom);

  const execute = useCallback(
    () => evaluate(screen, js, context),
    [context, js, screen],
  );
  return execute;
};
