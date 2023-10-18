import { useState } from "react";
import { type PickFilesAction, useRegisterBindings } from "framework";
import {
  useEnsembleAction,
  type EnsembleActionHook,
} from "./useEnsembleAction";

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const [files, setFiles] = useState<FileList>();
  const onCompleteAction = useEnsembleAction(action?.onComplete);

  useRegisterBindings(
    {
      files,
    },
    action?.id,
    {
      setFiles,
    },
  );

  const callback = (): void => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = action?.allowMultiple || false;
      input.accept =
        action?.allowedExtensions?.map((ext) => ".".concat(ext))?.toString() ||
        "*/*";

      input.onchange = (event: Event): void => {
        const selectedFiles =
          (event.target as HTMLInputElement).files || undefined;

        if (selectedFiles) setFiles(selectedFiles);

        if (onCompleteAction) onCompleteAction?.callback();
      };
      input.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return { callback };
};
