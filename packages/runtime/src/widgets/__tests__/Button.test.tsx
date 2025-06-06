/* eslint-disable react/no-children-prop */
import React, { useState } from "react";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { ToastContainer } from "react-toastify";
import { Button, type ButtonProps } from "../Button";
import { createCustomWidget } from "../../runtime/customWidget";
import { Column } from "../Column";

describe("Button Widget Bindings Tests", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
  jest.spyOn(console, "error").mockImplementation(jest.fn());

  afterEach(() => {
    logSpy.mockClear();
    jest.clearAllMocks();
  });

  test("test button loading using setLoading", async () => {
    // Render the button component
    const { container } = render(
      <>
        <Button id="checkLoader" label="Check Loader" />
        <Button
          label="Start Loader"
          onTap={{
            executeCode: "checkLoader.setLoading(true)",
          }}
        />
        <Button
          label="Stop Loader"
          onTap={{
            executeCode: "checkLoader.setLoading(false)",
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const loaderBtn = screen.getByText("Check Loader");

    await waitFor(() => {
      expect(loaderBtn).toBeInTheDocument();
      expect(loaderBtn).not.toHaveAttribute("disabled");
    });

    const startButton = screen.getByText("Start Loader");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).not.toBeInTheDocument();
      expect(container.querySelector(".anticon-loading")).toBeInTheDocument();
    });

    const stopButton = screen.getByText("Stop Loader");
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).toBeInTheDocument();
      expect(
        container.querySelector(".anticon-loading"),
      ).not.toBeInTheDocument();
    });
  });

  test("test button loading using bindings and update through setLoading", async () => {
    const Test = createCustomWidget({
      onLoad: {
        executeCode: "ensemble.storage.set('loaderStat', true)",
      },
      name: "",
      inputs: [],
      body: {
        name: "Row",
        properties: {},
      },
    });

    // Render the button component
    const { container } = render(
      <>
        <Test events={{}} inputs={{}} />
        <Column
          children={[
            {
              name: "Button",
              properties: {
                id: "checkLoader",
                label: "Check Loader",
                loading: `\${ensemble.storage.get('loaderStat')}`,
              },
            },
            {
              name: "Button",
              properties: {
                id: "stopLoader",
                label: "Stop Loader",
                onTap: {
                  executeCode: "checkLoader.setLoading(!checkLoader.loading)",
                },
              },
            },
          ]}
        />
      </>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).not.toBeInTheDocument();
      expect(container.querySelector(".anticon-loading")).toBeInTheDocument();
    });

    const stopButton = screen.getByText("Stop Loader");
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).toBeInTheDocument();
      expect(
        container.querySelector(".anticon-loading"),
      ).not.toBeInTheDocument();
    });
  });

  test("test button loading using bindings and update through setLoading 2", async () => {
    const Test = createCustomWidget({
      onLoad: {
        executeCode: "ensemble.storage.set('loaderStat', false)",
      },
      name: "",
      inputs: [],
      body: {
        name: "Row",
        properties: {},
      },
    });

    // Render the button component
    const { container } = render(
      <>
        <Test events={{}} inputs={{}} />
        <Column
          children={[
            {
              name: "Button",
              properties: {
                id: "checkLoader",
                label: "Check Loader",
                loading: `\${ensemble.storage.get('loaderStat')}`,
              },
            },
            {
              name: "Button",
              properties: {
                id: "startLoader",
                label: "Start Loader",
                onTap: {
                  executeCode: "checkLoader.setLoading(!checkLoader.loading)",
                },
              },
            },
          ]}
        />
      </>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).toBeInTheDocument();
      expect(
        container.querySelector(".anticon-loading"),
      ).not.toBeInTheDocument();
    });

    const startButton = screen.getByText("Start Loader");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).not.toBeInTheDocument();
      expect(container.querySelector(".anticon-loading")).toBeInTheDocument();
    });
  });

  test("test button loading using bindings", async () => {
    const Test = createCustomWidget({
      onLoad: {
        executeCode: "ensemble.storage.set('loaderStat', true)",
      },
      name: "",
      inputs: [],
      body: {
        name: "Row",
        properties: {},
      },
    });

    // Render the button component
    const { container } = render(
      <>
        <Test events={{}} inputs={{}} />
        <Column
          children={[
            {
              name: "Button",
              properties: {
                id: "checkLoader",
                label: "Check Loader",
                loading: `\${ensemble.storage.get('loaderStat')}`,
              },
            },
            {
              name: "Button",
              properties: {
                id: "stopLoader",
                label: "Stop Loader",
                onTap: {
                  executeCode: "ensemble.storage.set('loaderStat', false)",
                },
              },
            },
          ]}
        />
      </>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).not.toBeInTheDocument();
      expect(container.querySelector(".anticon-loading")).toBeInTheDocument();
    });

    const stopButton = screen.getByText("Stop Loader");
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(screen.queryByText("Check Loader")).toBeInTheDocument();
      expect(
        container.querySelector(".anticon-loading"),
      ).not.toBeInTheDocument();
    });
  });
});

// Create a wrapper component to track renders
const createButtonWithRenderCounter = () => {
  const renderCount = { current: 0 };

  const TestButton = (props: any) => {
    renderCount.current += 1;
    return <Button {...props} />;
  };

  return { TestButton, renderCount };
};

describe("Button Component Render Tests", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test("should prevent unnecessary re-renders with memo", () => {
    const { TestButton, renderCount } = createButtonWithRenderCounter();
    const MemoizedTestButton = React.memo(TestButton);

    // Create a parent component
    const Parent = () => {
      const [count, setCount] = useState(0);

      return (
        <div>
          <MemoizedTestButton id="test-button" label="Test" />
          <button
            data-testid="parent-updater"
            onClick={() => setCount((c) => c + 1)}
            type="button"
          >
            Update Parent
          </button>
          <div data-testid="count">{count}</div>
        </div>
      );
    };

    const { getByTestId } = render(<Parent />);

    // Initial render
    expect(renderCount.current).toBe(1);

    // Update parent state
    act(() => {
      fireEvent.click(getByTestId("parent-updater"));
    });

    // Count in parent should update
    expect(getByTestId("count").textContent).toBe("1");

    // Button should not re-render due to memo
    expect(renderCount.current).toBe(1);
  });

  test("should re-render when props change", () => {
    const { TestButton, renderCount } = createButtonWithRenderCounter();
    const MemoizedTestButton = React.memo(TestButton);

    const Parent = () => {
      const [label, setLabel] = useState("Initial Label");
      const [styles, setStyles] = useState({ color: "red" });

      return (
        <div>
          <MemoizedTestButton id="test-button" label={label} styles={styles} />
          <button
            data-testid="label-updater"
            onClick={() => setLabel("Updated Label")}
            type="button"
          >
            Update Label
          </button>
          <button
            data-testid="styles-updater"
            onClick={() => setStyles({ color: "blue" })}
            type="button"
          >
            Update Styles
          </button>
        </div>
      );
    };

    const { getByTestId } = render(<Parent />);

    // Initial render
    expect(renderCount.current).toBe(1);

    // Update label
    act(() => {
      fireEvent.click(getByTestId("label-updater"));
    });

    // Should re-render once because prop changed
    expect(renderCount.current).toBe(2);

    // Update styles
    act(() => {
      fireEvent.click(getByTestId("styles-updater"));
    });

    // Should re-render once because prop changed
    expect(renderCount.current).toBe(3);
  });

  test("should handle debounced updates via useRegisterBindings", async () => {
    const { TestButton, renderCount } = createButtonWithRenderCounter();
    const MemoizedTestButton = React.memo(TestButton);

    const Parent = () => {
      const [label, setLabel] = useState("Initial Label");

      return (
        <div>
          <MemoizedTestButton
            id="test-button"
            label={label}
            options={{ debounceMs: 100 }}
          />
          <button
            data-testid="rapid-updater"
            onClick={() => {
              setLabel("Label 1");
              setTimeout(() => setLabel("Label 2"), 50);
              setTimeout(() => setLabel("Label 3"), 75);
            }}
            type="button"
          >
            Rapid Update
          </button>
        </div>
      );
    };

    const { getByTestId } = render(<Parent />);
    expect(renderCount.current).toBe(1);

    await act(async () => {
      fireEvent.click(getByTestId("rapid-updater"));
      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });
    });

    // Should have debounced multiple updates into fewer renders
    expect(renderCount.current).toBeLessThan(4);
  });

  test("should re-render when bindings change", async () => {
    const { TestButton, renderCount } = createButtonWithRenderCounter();
    const MemoizedTestButton = React.memo(TestButton);

    const Parent = () => {
      return (
        <div>
          <MemoizedTestButton
            id="test-button"
            // eslint-disable-next-line no-template-curly-in-string
            label="${ensemble.storage.get('btnLabel')}"
            options={{ debounceMs: 100 }}
          />
          <Button
            label="Change button label"
            onTap={{
              executeCode:
                "ensemble.storage.set('btnLabel', 'Ensemble Button')",
            }}
          />
        </div>
      );
    };

    render(<Parent />, { wrapper: BrowserRouter });

    expect(renderCount.current).toBe(1);

    const buttonEl = screen.getByText("Change button label");
    // Trigger the button click
    act(() => {
      fireEvent.click(buttonEl);
    });

    await waitFor(() => {
      expect(screen.getByText("Ensemble Button")).toBeInTheDocument();
    });
  });
});

describe("Button Widget File Upload Tests", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
  jest.spyOn(console, "error").mockImplementation(jest.fn());

  afterEach(() => {
    logSpy.mockClear();
    jest.clearAllMocks();
  });

  test("upload files using pickFiles", async () => {
    render(
      <Button
        id="pickImageButton"
        label="Pick Image"
        onTap={{
          pickFiles: {
            allowedExtensions: ["jpg", "png"],
          },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const imageBlob = new Blob(["image binary data"], { type: "image/png" });

    const files = [
      new File([imageBlob], "example1.png", { type: "image/png" }),
    ];

    const pickFiles = document.querySelector("input")!;

    userEvent.upload(pickFiles, files);

    await waitFor(() => {
      expect(screen.getByText("Pick Image")).toBeInTheDocument();
      expect(pickFiles.files).toHaveLength(1);
      expect(pickFiles.files?.[0].name).toBe("example1.png");
    });
  });

  test("upload files using pickFiles and test reset", async () => {
    render(
      <>
        <Button
          id="pickImageButton"
          label="Pick Image"
          onTap={{
            pickFiles: {
              id: "imageInput",
              allowedExtensions: ["jpg", "png"],
              onComplete: {
                executeCode: "console.log('Image Uploaded')",
              },
            },
          }}
        />
        <Button
          label="Clear Input"
          onTap={{
            executeCode: "imageInput.reset()",
          }}
        />
        <Button
          label="Verify Input"
          onTap={{
            executeCode:
              "console.log({ input: document.querySelector('input').files})",
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const imageBlob = new Blob(["image binary data"], { type: "image/png" });
    const files = [new File([imageBlob], "example.png", { type: "image/png" })];

    const pickFiles = document.querySelector("input") as HTMLInputElement;

    // Upload file
    await waitFor(() => {
      userEvent.upload(pickFiles, files);
    });

    // First verify file is uploaded
    await waitFor(() => {
      expect(pickFiles.files).toHaveLength(1);
      expect(pickFiles.files?.[0].name).toBe("example.png");
      expect(logSpy).toHaveBeenCalledWith("Image Uploaded");
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText("Clear Input"));
      fireEvent.click(screen.getByText("Verify Input"));
      expect(logSpy).toHaveBeenCalledWith({ input: null });
    });
  });
});

// Mock window.open before tests
const originalWindow = window;
const mockOpen = jest.fn();

beforeAll(() => {
  window.open = mockOpen;
});

// Restore original window after tests
afterAll(() => {
  window.open = originalWindow.open;
});

// Clear mock calls before each test
beforeEach(() => {
  mockOpen.mockClear();
});

test("should update the action on bindings changes and track renders", async () => {
  let renderCount = 0;

  // Wrapper component to track renders that evaluates the binding
  const NavigateButton: React.FC<ButtonProps> = (props) => {
    // Evaluate the binding in wrapper to track re-renders
    const { values } = useRegisterBindings({
      url: `\${ensemble.storage.get('targetUrl')}`,
    });

    renderCount++;

    return (
      <Button
        {...props}
        onTap={{
          navigateExternalScreen: values?.url,
        }}
      />
    );
  };

  render(
    <>
      <NavigateButton id="navigateUrl" label="Navigate URL" />
      <Button
        label="Update target url 1"
        onTap={{
          executeCode: "ensemble.storage.set('targetUrl', 'http://google.com')",
        }}
      />
      <Button
        label="Update target url 2"
        onTap={{
          executeCode:
            "ensemble.storage.set('targetUrl', 'http://youtube.com')",
        }}
      />
    </>,
    {
      wrapper: BrowserRouter,
    },
  );

  // Initial render
  expect(renderCount).toBe(2);

  const updateUrlbtn1 = screen.getByText("Update target url 1");
  fireEvent.click(updateUrlbtn1);

  // Should re-render after storage update
  await waitFor(() => {
    expect(renderCount).toBe(3);
  });

  const navigateUrlbtn = screen.getByText("Navigate URL");
  fireEvent.click(navigateUrlbtn);

  await waitFor(() => {
    expect(mockOpen).toHaveBeenCalledWith("http://google.com", "_self");
  });

  const updateUrlbtn2 = screen.getByText("Update target url 2");
  fireEvent.click(updateUrlbtn2);

  // Should re-render after second storage update
  await waitFor(() => {
    expect(renderCount).toBe(4);
  });

  fireEvent.click(navigateUrlbtn);

  await waitFor(() => {
    expect(mockOpen).toHaveBeenCalledWith("http://youtube.com", "_self");
  });
});

describe("check for pass result of executeCode into nested actions", () => {
  test("should pass result of executeCode into nested action", async () => {
    render(
      <>
        <ToastContainer />
        <Button
          id="checkLoader"
          label="Set Storage"
          onTap={{
            executeCode:
              "ensemble.storage.set('toast_message', 'This is toast')",
          }}
        />
        <Button
          label="Check Toast"
          onTap={{
            executeCode: {
              body: "ensemble.storage.get('toast_message')",
              onComplete: {
                showToast: {
                  message: `\${result}`,
                  options: {
                    position: "topRight",
                    type: "success",
                  },
                },
              },
            },
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const setStorageBtn = screen.getByText("Set Storage");
    fireEvent.click(setStorageBtn);

    const checkToastBtn = screen.getByText("Check Toast");
    userEvent.click(checkToastBtn);

    await waitFor(() => {
      expect(screen.getByText("This is toast")).toBeInTheDocument();
    });
  });

  test("should pass result of async/await executeCode into nested action", async () => {
    render(
      <>
        <ToastContainer />
        <Button
          id="checkLoader"
          label="Set Storage"
          onTap={{
            executeCode:
              "ensemble.storage.set('toast_message', 'This is async toast')",
          }}
        />
        <Button
          label="Check Toast"
          onTap={{
            executeCode: {
              body: "await new Promise((resolve) => setTimeout(() => resolve(ensemble.storage.get('toast_message')), 1000))",
              onComplete: {
                showToast: {
                  message: `\${result}`,
                  options: {
                    position: "topRight",
                    type: "success",
                  },
                },
              },
            },
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const setStorageBtn = screen.getByText("Set Storage");
    fireEvent.click(setStorageBtn);

    const checkToastBtn = screen.getByText("Check Toast");
    userEvent.click(checkToastBtn);

    await waitFor(
      () => {
        expect(screen.getByText("This is async toast")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
/* eslint-enable react/no-children-prop */
