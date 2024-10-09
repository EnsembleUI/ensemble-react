/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { Form, Button } from "../../index";

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

describe("Dropdown Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <>
        <Form
          children={[
            {
              name: "Dropdown",
              properties: {
                id: "dropdown",
                label: "Select One",
                items: [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                ],
                value: "option2",
              },
            },
          ]}
          id="form"
        />
        <Button
          label="Check value"
          onTap={{
            executeCode: "console.log(form.getValues())",
          }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );

    const getValueButton = screen.getByText("Check value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ dropdown: "option2" }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Dropdown",
            properties: {
              id: "dropdown",
              label: "Select One",
              items: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
              ],
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set value",
              onTap: { executeCode: "dropdown.setValue('option2')" },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Check value",
              onTap: { executeCode: "console.log(form.getValues())" },
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const setValueButton = screen.getByText("Set value");
    const getValueButton = screen.getByText("Check value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ dropdown: "option2" }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
