import {
  evaluate,
  useScreenContext,
  type ShowToastAction,
  isExpression,
} from "framework";
import type { Id } from "react-toastify";
import { toast } from "react-toastify";
import { useMemo, useRef } from "react";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useShowToast: EnsembleActionHook<ShowToastAction> = (action) => {
  const ref = useRef<Id | null>(null);
  const screen = useScreenContext();
  const showToast = useMemo(() => {
    if (!action?.message) {
      return;
    }

    return {
      callback: (): void => {
        let message = action.message;
        if (isExpression(action.message) && screen) {
          message = String(evaluate(screen, action.message));
        }
        if (!ref.current || !toast.isActive(ref.current)) {
          ref.current = toast.success(message, {
            position: "bottom-right",
            toastId: message,
          });
        }
      },
    };
  }, [action?.message, screen]);
  return showToast;
};
