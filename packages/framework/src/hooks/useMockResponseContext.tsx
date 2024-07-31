import { useAtom } from "jotai";
import { useMockResponseAtom } from "../state";
import { useCallback } from "react";

export const useMockResponseContext = () => {
    const [useMockResponse, modifyUseMockResponse] = useAtom(useMockResponseAtom);
    const setUseMockResponse = useCallback((value: boolean) => {
        modifyUseMockResponse(value);
    }, [modifyUseMockResponse]);
    return { useMockResponse, setUseMockResponse };
};