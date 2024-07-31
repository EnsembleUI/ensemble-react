import { useAtom } from "jotai";
import { useCallback } from "react";
import { useMockResponseAtom } from "../state";

export const useMockResponseContext = () => {
  const [useMockResponse, modifyUseMockResponse] = useAtom(useMockResponseAtom);
  const setUseMockResponse = useCallback(
    (value: boolean) => {
      modifyUseMockResponse(value);
    },
    [modifyUseMockResponse],
  );
  return { useMockResponse, setUseMockResponse };
};
