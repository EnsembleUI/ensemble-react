import { type ShowToastAction, useEvaluate } from "@ensembleui/react-framework";
import type { Id, ToastPosition } from "react-toastify";
import { toast } from "react-toastify";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EnsembleActionHook } from "./useEnsembleAction";

const positionMapping: { [key: string]: ToastPosition } = {
  top: "top-center",
  topLeft: "top-left",
  topRight: "top-right",
  center: "bottom-center",
  centerLeft: "bottom-left",
  centerRight: "bottom-right",
  bottom: "bottom-center",
  bottomLeft: "bottom-left",
  bottomRight: "bottom-right",
};

export const useShowToast: EnsembleActionHook<ShowToastAction> = (action) => {
  const ref = useRef<Id | null>(null);
  const [isMessageShowed, setIsMessageShowed] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();
  const evaluatedInputs = useEvaluate(
    { ...action },
    {
      context,
    },
  );

  const showToast = useMemo(() => {
    if (!action?.message) {
      return;
    }

    return {
      callback: (args: unknown): void => {
        setIsMessageShowed(false);
        setContext(args as { [key: string]: unknown });
      },
    };
  }, [action?.message, setContext, setIsMessageShowed]);

  useEffect(() => {
    if (!evaluatedInputs.message || isMessageShowed !== false) {
      return;
    }

    if (!ref.current || !toast.isActive(ref.current)) {
      ref.current = toast.success(evaluatedInputs.message, {
        position:
          positionMapping[evaluatedInputs.options?.position || "bottomRight"],
        type: evaluatedInputs.options?.type,
        toastId: evaluatedInputs.message,
      });
    }

    setIsMessageShowed(true);
  }, [evaluatedInputs, isMessageShowed, setIsMessageShowed]);

  return showToast;
};
