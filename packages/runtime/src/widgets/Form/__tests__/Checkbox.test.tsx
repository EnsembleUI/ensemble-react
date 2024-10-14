/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form } from "../../index";
import { FormTestWrapper } from "./__shared__/fixtures";

const defaultFormButton = [
  {
    name: "Button",
    properties: {
      label: "Get Value",
      onTap: {
        executeCode: "console.log(form.getValues())",
      },
    },
  },
];

describe("Checkbox Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Checkbox",
            properties: {
              id: "initialValue",
              label: "Check Box",
              value: `\${true}`,
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Check Box")).toBeChecked();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ initialValue: true }),
      );
    });
  });

  test("updates when calling setValue", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Checkbox",
            properties: {
              id: "checkbox",
              label: "Check Box With Value",
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
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Check Box With Value")).toBeChecked();
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
              id: "binding",
              label: "Check Box With Binding",
              value: `\${ensemble.storage.get('binding')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('binding',true)",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);

    await waitFor(() => {
      fireEvent.click(getValueButton);
      expect(screen.getByLabelText("Check Box With Binding")).toBeChecked();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ binding: true }),
      );
    });
  });

  test("binding change overwrites user input value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Checkbox",
            properties: {
              id: "userInput",
              label: "Check Box With User Input",
              value: `\${ensemble.storage.get('userInput') ?? true}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('userInput',false)",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);

    await waitFor(() => {
      fireEvent.click(getValueButton);
      expect(
        screen.getByLabelText("Check Box With User Input"),
      ).not.toBeChecked();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: false }),
      );
    });
  });
});

/* eslint-enable react/no-children-prop */
