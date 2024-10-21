/* eslint-disable react/no-children-prop */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { Button } from "../Button";
import { createCustomWidget } from "../../runtime/customWidget";
import { Column } from "../Column";

describe("Button", () => {
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
/* eslint-enable react/no-children-prop */
