import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { useScreenData } from "../useScreenData";
import type { ScreenContextDefinition } from "../../state";
import { screenAtom } from "../../state";
import type { Response } from "../../data";
import type { EnsembleMockResponse } from "../../shared";

const store = getDefaultStore();
const mockScreen = {
  widgets: {},
  data: {},
  storage: {},
  model: {
    id: "test",
    name: "test",
    body: {
      name: "Row",
      properties: {},
    },
    apis: [
      {
        name: "test",
        method: "GET",
      },
    ],
  },
} as ScreenContextDefinition;

describe("useScreenData", () => {
  beforeEach(() => {
    store.set(screenAtom, mockScreen);
  });
  test("returns the api models", () => {
    const { result } = renderHook(() => useScreenData());

    expect(result.current).toMatchObject({
      apis: [
        {
          name: "test",
          method: "GET",
        },
      ],
    });
  });
  test("updates data responses", () => {
    const mockResponse = {} as Response;
    const { result } = renderHook(() => useScreenData());

    act(() => {
      result.current.setData("test", mockResponse);
    });

    expect(result.current.data).toMatchObject({
      test: mockResponse,
    });
  });
  test("evaluates mock responses", () => {
    const mockResponse = {} as EnsembleMockResponse;
    const { result } = renderHook(() => useScreenData());

    expect(result.current).toMatchObject({
      mockResponses: {
        test: mockResponse,
      },
    });
  });
  test("updates multiple responses", () => {
    const mockResponse = {} as Response;
    const { result } = renderHook(() => useScreenData());

    act(() => {
      result.current.setData("test", mockResponse);
      result.current.setData("test2", mockResponse);
    });

    expect(result.current.data).toMatchObject({
      test: mockResponse,
      test2: mockResponse,
    });
  });
});
