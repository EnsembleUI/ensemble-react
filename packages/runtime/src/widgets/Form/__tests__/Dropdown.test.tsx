/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
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

describe("Dropdown Widget", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
  jest.spyOn(console, "error").mockImplementation(jest.fn());

  afterEach(() => {
    logSpy.mockClear();
    jest.clearAllMocks();
  });

  test("initializes with a binding value", async () => {
    render(
      <Form
        children={[
          {
            name: "Dropdown",
            properties: {
              id: "initialValue",
              label: "Select One",
              items: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
              ],
              value: `\${"option2"}`,
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
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ initialValue: "option2" }),
      );
    });
  });

  test("updates when calling setValue", async () => {
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
              label: "Set Value",
              onTap: { executeCode: "dropdown.setValue('option2')" },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ dropdown: "option2" }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    render(
      <Form
        children={[
          {
            name: "Dropdown",
            properties: {
              id: "binding",
              label: "Select One",
              items: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
              ],
              value: `\${ensemble.storage.get('binding')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('binding', 'option3')",
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
      expect(screen.getByText("Option 3")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ binding: "option3" }),
      );
    });
  });

  test("binding change overwrites user input value", async () => {
    render(
      <Form
        children={[
          {
            name: "Dropdown",
            properties: {
              id: "userInput",
              label: "Select One",
              items: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
              ],
              value: `\${ensemble.storage.get('userInput')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode: "ensemble.storage.set('userInput', 'option2')",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    userEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByTitle("Option 3"));
    userEvent.click(screen.getByRole("combobox"));

    fireEvent.click(screen.getByText("Set Value"));

    await waitFor(() => expect(screen.getByText("Option 3")).toBeVisible());

    await waitFor(() => {
      fireEvent.click(screen.getByText("Get Value"));
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: "option2" }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
