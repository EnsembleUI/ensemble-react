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
});
