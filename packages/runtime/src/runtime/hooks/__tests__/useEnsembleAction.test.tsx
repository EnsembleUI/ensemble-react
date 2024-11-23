/* eslint import/first: 0 */
import { act, renderHook } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useEnsembleAction } from "../useEnsembleAction";

jest.mock("react-markdown", jest.fn());
jest.mock("react-router-dom");

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ScreenContextProvider
    context={{
      widgets: {
        myWidget: {
          values: {
            value: 2,
          },
          invokable: {
            id: "myWidget",
          },
        },
      },
      data: {},
      storage: {},
    }}
    screen={{
      id: "test",
      name: "test",
      body: { name: "Widget", properties: {} },
      apis: [
        {
          name: "getDummyProductsByPaginate",
          method: "GET",
          // eslint-disable-next-line no-template-curly-in-string
          uri: "https://dummyjson.com/products?skip=${skip}&limit=${limit}",
          inputs: ["skip", "limit"],
        },
      ],
    }}
  >
    {children}
  </ScreenContextProvider>
);

describe("Test cases for useEnsembleAction Hook", () => {
  it("should return undefined when no action is provided", () => {
    const { result } = renderHook(() => useEnsembleAction(undefined));

    expect(result.current).toBeUndefined();
  });

  it("should return useExecuteCode when action is a string", async () => {
    const { result } = renderHook(() => useEnsembleAction("myWidget.value"), {
      wrapper,
    });

    let execResult;

    await act(async () => {
      execResult = await result.current?.callback();
    });

    expect(execResult).toBe(2);
  });
});
