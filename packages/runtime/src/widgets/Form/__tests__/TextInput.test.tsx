/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form } from "../../index";
import { FormTestWrapper } from "./__shared__/fixtures";

const defaultFormContent = [
  {
    name: "TextInput",
    properties: {
      label: "Number input",
      id: "numberInput",
    },
  },
];

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

describe("TextInput", () => {
  test("allows numeric keys to be entered", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[...defaultFormContent, ...defaultFormButton]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "123" } });

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "123" }),
      );
    });
  });

  test("filter numeric keys to be entered", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[...defaultFormContent, ...defaultFormButton]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "Hello 123" } });

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "123" }),
      );
    });
  });

  test("max number allow", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "Number input",
              id: "numberInput",
              maxLength: 4,
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "123456" } });

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "1234" }),
      );
    });
  });

  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              id: "initialInput",
              label: "Text Input",
              value: `\${"ensemble"}`,
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
      expect(screen.getByDisplayValue("ensemble")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ initialInput: "ensemble" }),
      );
    });
  });

  test("updates when calling setValue", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              id: "textInput",
              label: "Text Input",
              value: "ensemble",
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "textInput.setValue('ensemble')",
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
      expect(screen.getByDisplayValue("ensemble")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ textInput: "ensemble" }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              id: "binding",
              label: "Text Input",
              value: `\${ensemble.storage.get('binding')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('binding','bindingValue')",
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
      expect(screen.getByDisplayValue("bindingValue")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ binding: "bindingValue" }),
      );
    });
  });

  test("binding change overwrites user input value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              id: "userInput",
              label: "Text Input",
              value: `\${ensemble.storage.get('userInput') ?? 'text input'}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('userInput','ensemble')",
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
      expect(screen.getByDisplayValue("ensemble")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: "ensemble" }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
