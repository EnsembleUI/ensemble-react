import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { EnsembleScreen } from "../screen";
import { WidgetRegistry } from "../../registry";
import { createCustomWidget } from "../customWidget";
import "../../widgets";

describe("Custom Widget", () => {
  beforeAll(() => {
    WidgetRegistry.register(
      "MyCustomWidget",
      createCustomWidget({
        name: "MyCustomWidget",
        inputs: ["foo", "baz"],
        body: {
          name: "Row",
          properties: {
            children: [
              {
                name: "Text",
                properties: {
                  // eslint-disable-next-line no-template-curly-in-string
                  text: "${foo.bar}",
                },
              },
              {
                name: "Text",
                properties: {
                  // eslint-disable-next-line no-template-curly-in-string
                  text: "${baz ? baz : 'world'}",
                },
              },
              {
                name: "Button",
                properties: {
                  label: "Modify",
                  onTap: {
                    executeCode: `
                      foo = { bar: 'goodbye' }
                    `,
                  },
                },
              },
            ],
          },
        },
      }),
    );

    // register a widget that tests storage timing in onLoad
    WidgetRegistry.register(
      "StorageTestWidget",
      createCustomWidget({
        name: "StorageTestWidget",
        inputs: ["userFilters"],
        onLoad: {
          executeCode: `
            console.log('userFilters in onLoad:', userFilters);
            console.log('userFilters type:', typeof userFilters);
            console.log('userFilters JSON:', JSON.stringify(userFilters));
          `,
        },
        body: {
          name: "Text",
          properties: {
            // eslint-disable-next-line no-template-curly-in-string
            text: "UserFilters: ${JSON.stringify(userFilters)}",
            id: "userFiltersText",
          },
        },
      }),
    );
  });

  beforeEach(() => {
    sessionStorage.setItem(
      "ensemble.storage",
      JSON.stringify({
        userFilters: { status: "active", priority: "high" },
      }),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("renders custom widget with unspecified inputs", async () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test",
          id: "test",
          body: {
            name: "MyCustomWidget",
            properties: {
              inputs: {
                foo: {
                  bar: "hello",
                },
              },
            },
          },
        }}
      />,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => {
      expect(screen.getByText("hello")).toBeInTheDocument();
      expect(screen.getByText("world")).toBeInTheDocument();
    });
  });

  it("have new scope for inputs", async () => {
    render(
      <EnsembleScreen
        inputs={{
          foo: {
            bar: "hello",
          },
        }}
        screen={{
          name: "test",
          id: "test",
          inputs: ["foo", "bar"],
          body: {
            name: "Row",
            properties: {
              children: [
                {
                  name: "Text",
                  properties: {
                    // eslint-disable-next-line no-template-curly-in-string
                    text: "${foo.bar}",
                  },
                },
                {
                  name: "MyCustomWidget",
                  properties: {
                    inputs: {
                      // eslint-disable-next-line no-template-curly-in-string
                      foo: "${foo}",
                    },
                  },
                },
              ],
            },
          },
        }}
      />,
      {
        wrapper: BrowserRouter,
      },
    );

    screen.getByText("Modify").click();

    await waitFor(() => {
      expect(screen.queryByText("goodbye")).toBeNull();
    });
  });

  it("onLoad action has access to widget inputs bound to storage", async () => {
    const logSpy = jest.spyOn(console, "log");

    render(
      <EnsembleScreen
        screen={{
          name: "test",
          id: "test",
          body: {
            name: "StorageTestWidget",
            properties: {
              inputs: {
                // This is the exact scenario from the user's issue
                // eslint-disable-next-line no-template-curly-in-string
                userFilters: "${ensemble.storage.get('userFilters') ?? {}}",
              },
            },
          },
        }}
      />,
      {
        wrapper: BrowserRouter,
      },
    );

    // wait for the component to render and onLoad to execute
    await waitFor(() => {
      // verify console logs show userFilters was correctly evaluated
      expect(logSpy).toHaveBeenCalledWith("userFilters in onLoad:", {
        status: "active",
        priority: "high",
      });
      expect(logSpy).toHaveBeenCalledWith("userFilters type:", "object");
      expect(logSpy).toHaveBeenCalledWith(
        "userFilters JSON:",
        '{"status":"active","priority":"high"}',
      );

      const userFiltersText = screen.getByTestId("userFiltersText");

      // verify that userFilters (widget input) got the correct storage value
      expect(userFiltersText).toHaveTextContent(
        'UserFilters: {"status":"active","priority":"high"}',
      );
    });
  });

  it("onLoad action executes after widget inputs are properly evaluated", async () => {
    const logSpy = jest.spyOn(console, "log");

    // set storage data with different key to test the exact user scenario
    sessionStorage.setItem(
      "ensemble.storage",
      JSON.stringify({
        userFilters: { category: "work", completed: false },
      }),
    );

    render(
      <EnsembleScreen
        screen={{
          name: "test",
          id: "test",
          body: {
            name: "StorageTestWidget",
            properties: {
              inputs: {
                // This matches the user's exact input binding
                // eslint-disable-next-line no-template-curly-in-string
                userFilters: "${ensemble.storage.get('userFilters') ?? {}}",
              },
            },
          },
        }}
      />,
      {
        wrapper: BrowserRouter,
      },
    );

    // initially, the widget content should NOT be visible because onLoad hasn't completed yet
    expect(screen.queryByTestId("userFiltersText")).not.toBeInTheDocument();

    // wait for storage hydration and onLoad execution
    await waitFor(() => {
      // verify console logs show userFilters was correctly evaluated with different data
      expect(logSpy).toHaveBeenCalledWith("userFilters in onLoad:", {
        category: "work",
        completed: false,
      });
      expect(logSpy).toHaveBeenCalledWith("userFilters type:", "object");
      expect(logSpy).toHaveBeenCalledWith(
        "userFilters JSON:",
        '{"category":"work","completed":false}',
      );

      const userFiltersText = screen.getByTestId("userFiltersText");

      // widget input should have the correct storage data
      expect(userFiltersText).toHaveTextContent(
        'UserFilters: {"category":"work","completed":false}',
      );
    });
  });
});
