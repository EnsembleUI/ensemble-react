const mockResponseTable: Record<string, boolean> = {};

export const useMockResponse = (appId: string | undefined) => {
    if (typeof appId == 'undefined' || !(appId in mockResponseTable))
        return false;
    return mockResponseTable[appId];
}

export const setUseMockResponse = (appId: string | undefined, value: boolean) => {
    if (typeof appId == 'undefined')
        return;
    mockResponseTable[appId] = value
};