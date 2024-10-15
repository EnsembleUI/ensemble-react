/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
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
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
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
    const logSpy = jest.spyOn(console, "log");
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
    const logSpy = jest.spyOn(console, "log");
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

  test("binding change overwrites user input value", async () => {
    const logSpy = jest.spyOn(console, "log");
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
              label: "Set value",
              onTap: {
                executeCode:
                  "ensemble.storage.set('userInput', ['option1', 'option3'])",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(screen.getByTitle("Option 2"));
    fireEvent.click(screen.getByTitle("Option 4"));
    fireEvent.mouseDown(document.body);

    fireEvent.click(screen.getByText("Set value"));

    const option1 = screen.getByText("Option 1");
    const option3 = screen.getByText("Option 3");

    await waitFor(() => {
      fireEvent.click(screen.getByText("Get Value"));
      expect(option1).toBeInTheDocument();
      expect(option3).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userInput: ["option1", "option3"] }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
