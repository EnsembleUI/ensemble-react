/* eslint import/first: 0 */
import { act, renderHook } from "@testing-library/react";
import {
  ScreenContextProvider,
  ApplicationContextProvider,
} from "@ensembleui/react-framework";
import { useEnsembleAction } from "../useEnsembleAction";
import { useNavigateScreen } from "../useNavigateScreen";

jest.mock("react-markdown", jest.fn());

const mockNavigate = jest.fn();
const mockLocation = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

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

const navigateScreenWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <ApplicationContextProvider
    app={{
      screens: [
        { name: "Home", id: "home", body: { name: "Button", properties: {} } },
        {
          name: "Details",
          id: "details",
          body: { name: "Button", properties: {} },
        },
      ],
      customWidgets: [],
      home: {
        name: "Home",
        id: "home",
        body: { name: "Button", properties: {} },
      },
      themes: {},
      id: "testApp",
      scripts: [],
    }}
  >
    <ScreenContextProvider
      context={{
        widgets: {
          myWidget: {
            values: {
              value: "home",
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
        id: "home",
        name: "Home",
        body: { name: "Button", properties: {} },
      }}
    >
      {children}
    </ScreenContextProvider>
  </ApplicationContextProvider>
);

describe("Test cases for useNavigateScreen Hook", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should not navigate when no action is provided", () => {
    const { result } = renderHook(() => useNavigateScreen(undefined), {
      wrapper: navigateScreenWrapper,
    });

    act(() => {
      result.current?.callback();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should navigate when action is a string", () => {
    const { result } = renderHook(
      // eslint-disable-next-line no-template-curly-in-string
      () => useNavigateScreen("home"),
      {
        wrapper: navigateScreenWrapper,
      },
    );

    act(() => {
      result.current?.callback();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/home", { state: undefined });
  });

  it("should navigate when action name is a variable", () => {
    const { result } = renderHook(
      // eslint-disable-next-line no-template-curly-in-string
      () => useNavigateScreen("${myWidget.value}"),
      {
        wrapper: navigateScreenWrapper,
      },
    );

    act(() => {
      result.current?.callback();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/home", { state: undefined });
  });

  it("should navigate with inputs when action is an object", () => {
    const action = {
      name: "Details",
      inputs: {
        id: 123,
        category: "test",
      },
    };

    const { result } = renderHook(() => useNavigateScreen(action), {
      wrapper: navigateScreenWrapper,
    });

    act(() => {
      result.current?.callback();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/details", {
      state: {
        id: 123,
        category: "test",
      },
    });
  });

  it("should not navigate when screen is not found", () => {
    const { result } = renderHook(
      () => useNavigateScreen("NonExistentScreen"),
      {
        wrapper: navigateScreenWrapper,
      },
    );

    act(() => {
      result.current?.callback();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
