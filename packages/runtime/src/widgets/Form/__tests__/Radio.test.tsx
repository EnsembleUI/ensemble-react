/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form } from "../../index";
import { FormTestWrapper } from "../../../shared/fixtures";

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

describe("Radio Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Radio",
            properties: {
              id: "initialValue",
              label: "Radio Group",
              items: [
                { label: "Option 1", value: 1 },
                { label: "Option 2", value: 2 },
                { label: "Option 3", value: 3 },
              ],
              value: 3,
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
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ initialValue: 3 }),
      );
    });
  });

  test("updates when calling setValue", async () => {
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
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ radio: 3 }),
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
              id: "binding",
              label: "Radio Group",
              items: [
                { label: "Option 1", value: 1 },
                { label: "Option 2", value: 2 },
                { label: "Option 3", value: 3 },
              ],
              value: `\${ensemble.storage.get('binding')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('binding', 2)",
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
    fireEvent.click(setValueButton);

    await waitFor(() => {
      fireEvent.click(getValueButton);
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ binding: 2 }),
      );
    });
  });

  test("binding change overwrites user input value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "Radio",
            properties: {
              id: "userInput",
              label: "Radio Group",
              items: [
                { label: "Option 1", value: 1 },
                { label: "Option 2", value: 2 },
                { label: "Option 3", value: 3 },
              ],
              value: `\${ensemble.storage.get('userInput') ?? 1}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('userInput', 3)",
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
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: 3 }),
      );
    });
  });
});

/* eslint-enable react/no-children-prop */
