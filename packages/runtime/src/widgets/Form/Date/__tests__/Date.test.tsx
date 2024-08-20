import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { Date as DateComponent } from "../Date";
import { Button } from "../../../Button";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.ResizeObserver = require("resize-observer-polyfill");

describe("Date widget", () => {
  test("initializes with no value", () => {
    render(<DateComponent label="test" />);

    expect(screen.getByPlaceholderText("Select date")).toBeInTheDocument();
  });

  test("initializes with a static value", () => {
    render(<DateComponent label="test" value="2024/04/04" />);

    expect(screen.getByDisplayValue("2024-04-04")).toBeInTheDocument();
  });

  test("initializes with a binding value", async () => {
    render(
      <DateComponent
        id="test"
        label="test"
        // CHECKME: this may not run in other timezones
        // eslint-disable-next-line no-template-curly-in-string
        value="${new Date('Apr 04 2024 11:00:00 PST').toISOString()}"
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-04-04")).toBeInTheDocument();
    });
  });

  test("updates when user changes value", async () => {
    render(
      <DateComponent
        label="test"
        // eslint-disable-next-line no-template-curly-in-string
        value="${new Date('Apr 04 2024 11:00:00 PST').toISOString()}"
      />,
    );

    const inputEl = screen.getByPlaceholderText("Select date");
    fireEvent.change(inputEl, { target: { value: "2021-08-12" } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("2021-08-12")).toBeInTheDocument();
    });
  });

  test("updates when binding changes value", async () => {
    render(
      <>
        <DateComponent
          label="test"
          // eslint-disable-next-line no-template-curly-in-string
          value="${ensemble.storage.get('value')}"
        />
        <Button
          label="Change Value"
          onTap={{ executeCode: "ensemble.storage.set('value', '2021-08-12')" }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const buttonEl = screen.getByText("Change Value");
    fireEvent.click(buttonEl);

    await waitFor(() => {
      expect(screen.getByDisplayValue("2021-08-12")).toBeInTheDocument();
    });
  });

  test("binding change overwrites user input value", async () => {
    render(
      <>
        <DateComponent
          label="test"
          // eslint-disable-next-line no-template-curly-in-string
          value="${ensemble.storage.get('value2') ?? new Date().toISOString()}"
        />
        <Button
          label="Change Value"
          onTap={{
            executeCode: "ensemble.storage.set('value2', '2021-08-12')",
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const inputEl = screen.getByPlaceholderText("Select date");
    fireEvent.change(inputEl, { target: { value: "2021-01-01" } });
    await waitFor(() => {
      expect(screen.getByDisplayValue("2021-01-01")).toBeInTheDocument();
    });

    const buttonEl = screen.getByText("Change Value");
    fireEvent.click(buttonEl);

    await waitFor(() => {
      expect(screen.getByDisplayValue("2021-08-12")).toBeInTheDocument();
    });
  });

  test("onChange callback is fired", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <DateComponent
        label="test"
        onChange={{ executeCode: "console.log('hello')" }}
        value="2024/04/04"
      />,
      { wrapper: BrowserRouter },
    );

    const inputEl = screen.getByPlaceholderText("Select date");
    fireEvent.change(inputEl, { target: { value: "2024-05-04" } });
    // This is required to kick onChange
    fireEvent.blur(inputEl);

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-05-04")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith("hello");
    });
  });
});
