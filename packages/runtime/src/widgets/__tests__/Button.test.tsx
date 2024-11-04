import React, { useState } from "react";
import "@testing-library/jest-dom";
import {
  render,
  fireEvent,
  act,
  screen,
  waitFor,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Button } from "../Button";

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

  test("should prevent unnecessary re-renders with memo", async () => {
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
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      fireEvent.click(getByTestId("parent-updater"));
    });

    // Count in parent should update
    expect(getByTestId("count").textContent).toBe("1");

    // Button should not re-render due to memo
    expect(renderCount.current).toBe(1);
  });

  test("should re-render when props change", async () => {
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
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      fireEvent.click(getByTestId("label-updater"));
    });

    // Should re-render once because prop changed
    expect(renderCount.current).toBe(2);

    // Update styles
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
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
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      fireEvent.click(buttonEl);
    });

    await waitFor(() => {
      expect(screen.getByText("Ensemble Button")).toBeInTheDocument();
    });
  });
});
