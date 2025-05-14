import { get, kebabCase } from "lodash-es";
import type { ShowToastAction } from "../shared/actions";

export const showToast = (
  toastAction: ShowToastAction | undefined,
  toaster?: (...args: unknown[]) => void,
): void => {
  if (!toastAction || !toaster) {
    return;
  }

  const position = kebabCase(
    get(toastAction.options, "position", "bottom-right"),
  );
  const type = get(toastAction.options, "type", "success");

  toaster(toastAction.message, {
    position,
    type,
  });
};
