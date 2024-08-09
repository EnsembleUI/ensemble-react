/* eslint-disable no-template-curly-in-string */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { Text } from "../Text";
import { Button } from "../Button";

describe("Text", () => {
  test("initializes value from binding", () => {
    render(<Text text="my first widget" />);

    expect(screen.getByText("my first widget")).toBeInTheDocument();
  });
  test("can set value with setText", async () => {
    render(
      <>
        <Text id="test" text="my first widget" />
        <Button
          label="Update"
          onTap={{ executeCode: "test.setText('my second widget')" }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const button = screen.getByText("Update");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("my second widget")).toBeInTheDocument();
    });
  });

  test("updates value from binding", async () => {
    render(
      <>
        <Text id="test" text="${ensemble.storage.get('value')}" />
        <Button
          label="Update"
          onTap={{ executeCode: "test.setText('my second widget')" }}
        />
        <Button
          label="Update Storage"
          onTap={{
            executeCode: "ensemble.storage.set('value', 'my third widget')",
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const button = screen.getByText("Update");
    fireEvent.click(button);
    const button2 = screen.getByText("Update Storage");
    fireEvent.click(button2);

    await waitFor(() => {
      expect(screen.getByText("my third widget")).toBeInTheDocument();
    });
  });
});

/* eslint-enable no-template-curly-in-string */
