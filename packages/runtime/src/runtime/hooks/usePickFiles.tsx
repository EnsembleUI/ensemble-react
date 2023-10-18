import { useState } from "react";
import { type PickFilesAction, useRegisterBindings } from "framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const usePickFiles: EnsembleActionHook<PickFilesAction> = (
  action?: PickFilesAction,
) => {
  const [files, setFiles] = useState<FileList>();

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

      input.onchange = (event: Event): void => {
        const selectedFiles =
          (event.target as HTMLInputElement).files || undefined;

        if (selectedFiles) setFiles(selectedFiles);
      };
      input.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return { callback };
};
