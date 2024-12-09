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

describe("MultiSelect Widget", () => {
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
            name: "MultiSelect",
            properties: {
              id: "multiSelect",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
              value: `\${["option2", "option4"]}`,
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
      expect(screen.getByText("Option 4")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ multiSelect: ["option2", "option4"] }),
      );
    });
  });

  test("updates when calling setValue", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "multiSelect",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set value",
              onTap: {
                executeCode:
                  "multiSelect.setSelectedValues(['option1', 'option3'])",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const setValueButton = screen.getByText("Set value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ multiSelect: ["option1", "option3"] }),
      );
    });
  });

  test("updates when binding changes value", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "binding",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
              value: `\${ensemble.storage.get('binding')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set value",
              onTap: {
                executeCode:
                  "ensemble.storage.set('binding',['option1', 'option3'])",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const setValueButton = screen.getByText("Set value");
    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(setValueButton);

    await waitFor(() => {
      fireEvent.click(getValueButton);
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ binding: ["option1", "option3"] }),
      );
    });
  });

  test("overwrites binding initial value with user input value then overwrite user input value with setSelectedValue", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "userInput",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
              value: `\${ensemble.storage.get('userInput')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "change bindings",
              onTap: {
                executeCode:
                  "ensemble.storage.set('userInput', ['option1', 'option3'])",
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Value",
              onTap: {
                executeCode:
                  "userInput.setSelectedValues(['option1', 'option3'])",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    fireEvent.click(screen.getByText("change bindings"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeVisible();
      expect(screen.getByText("Option 3")).toBeVisible();
    });

    userEvent.click(screen.getByRole("combobox"));
    userEvent.click(screen.getByTitle("Option 2"));
    userEvent.click(screen.getByTitle("Option 4"));
    userEvent.click(screen.getByRole("combobox"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(
        screen.getByText("Option 2", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
      expect(
        screen.getByText("Option 4", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
    });

    fireEvent.click(screen.getByText("Set Value"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(
        screen.getByText("Option 1", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
      expect(
        screen.getByText("Option 3", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
    });

    fireEvent.click(screen.getByText("Get Value"));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: ["option1", "option3"] }),
      );
    });
  });

  test("overwrite user selected value with initial value through binding change", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "userInput",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
              value: `\${ensemble.storage.get('userInput')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "change bindings",
              onTap: {
                executeCode:
                  "ensemble.storage.set('userInput', ['option1', 'option3'])",
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    userEvent.click(screen.getByRole("combobox"));
    userEvent.click(screen.getByTitle("Option 2"));
    userEvent.click(screen.getByTitle("Option 4"));
    userEvent.click(screen.getByRole("combobox"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(
        screen.getByText("Option 2", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
      expect(
        screen.getByText("Option 4", {
          selector: ".ant-select-selection-item-content",
        }),
      ).toBeVisible();
    });

    fireEvent.click(screen.getByText("change bindings"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeVisible();
      expect(screen.getByText("Option 3")).toBeVisible();
    });
  });
});
/* eslint-enable react/no-children-prop */
