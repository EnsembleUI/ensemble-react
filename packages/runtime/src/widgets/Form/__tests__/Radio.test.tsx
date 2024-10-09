/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import type { PropsWithChildren } from "react";
import { Form } from "../../index";

const FormTestWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <ScreenContextProvider
        screen={{
          id: "formTest",
          name: "formTest",
          body: { name: "Column", properties: {} },
        }}
      >
        {children}
      </ScreenContextProvider>
    </BrowserRouter>
  );
};

describe("Radio Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Radio",
            properties: {
              id: "radio",
              label: "Radio Group",
              items: [
                { label: "Option 1", value: 1 },
                { label: "Option 2", value: 2 },
                { label: "Option 3", value: 3 },
              ],
              value: 2,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Check Value",
              onTap: {
                executeCode: "console.log(form.getValues())",
              },
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const getValueButton = screen.getByText("Check Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ radio: 2 }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Radio",
            properties: {
              id: "radio",
              label: "Radio Group",
              items: [
                { label: "Option 1", value: 1 },
                { label: "Option 2", value: 2 },
                { label: "Option 3", value: 3 },
              ],
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "radio.setValue(3)",
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Check Value",
              onTap: {
                executeCode: "console.log(form.getValues())",
              },
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Check Value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ radio: 3 }),
      );
    });
  });
});

/* eslint-enable react/no-children-prop */
