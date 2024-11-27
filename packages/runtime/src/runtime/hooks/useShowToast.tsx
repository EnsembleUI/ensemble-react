import {
  evaluateDeep,
  type ShowToastAction,
  useCommandCallback,
  useScreenModel,
} from "@ensembleui/react-framework";
import type { Id, ToastPosition } from "react-toastify";
import { toast } from "react-toastify";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cloneDeep, merge } from "lodash-es";
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
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  const showToast = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      const evaluatedInputs = evaluateDeep(
        cloneDeep({ ...action }),
        screenModel,
        context,
      ) as ShowToastAction & { [key: string]: unknown };

      if (!ref.current || !toast.isActive(ref.current)) {
        ref.current = toast.success(evaluatedInputs.message, {
          position:
            positionMapping[
              evaluatedInputs.options?.position || "bottom-right"
            ],
          type: evaluatedInputs?.options?.type,
          toastId: evaluatedInputs.message,
        });
      }
    },
    { navigate },
    [action, screenModel],
  );

  return { callback: showToast };
};
