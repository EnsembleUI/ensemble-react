import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import "../../widgets";
import { EnsembleScreen } from "../screen";

describe("Ensemble Screen", () => {
  it("initializes inputs in context even if there is no value", async () => {
    render(
      <EnsembleScreen
        inputs={{
          bar: "baz",
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
                    text: "${foo ?? 'works'}",
                  },
                },
                {
                  name: "Text",
                  properties: {
                    // eslint-disable-next-line no-template-curly-in-string
                    text: "${bar}",
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

    await waitFor(() => {
      expect(screen.getByText("works")).toBeInTheDocument();
      expect(screen.getByText("baz")).toBeInTheDocument();
    });
  });
});
