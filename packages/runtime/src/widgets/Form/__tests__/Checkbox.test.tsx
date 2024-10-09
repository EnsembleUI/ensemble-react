/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import type { PropsWithChildren } from "react";
import { Button, Form } from "../../index";

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

describe("Checkbox Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <>
        <Form
          children={[
            {
              name: "Checkbox",
              properties: {
                id: "checkbox",
                label: "Check Box",
                value: true,
              },
            },
          ]}
          id="form"
        />
        <Button
          label="Check Value"
          onTap={{
            executeCode: "console.log(form.getValues())",
          }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );

    const getValueButton = screen.getByText("Check Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ checkbox: true }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Checkbox",
            properties: {
              id: "checkbox",
              label: "Check Box",
              value: false,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "checkbox.setValue(true)",
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
        expect.objectContaining({ checkbox: true }),
      );
    });
  });
});

/* eslint-enable react/no-children-prop */
