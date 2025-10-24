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

  test("dropdown items update when ensemble storage changes", async () => {
    render(
      <Form
        children={[
          {
            name: "Dropdown",
            properties: {
              id: "dynamicItems",
              label: "Dynamic Items",
              items: `\${ensemble.storage.get('dropdownItems')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Add Item",
              onTap: {
                executeCode: `
                  const currentItems = ensemble.storage.get('dropdownItems') || [];
                  ensemble.storage.set('dropdownItems', [
                    ...currentItems,
                    { label: 'New Item', value: 'newItem' }
                  ]);
                `,
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Remove Item",
              onTap: {
                executeCode: `
                  const currentItems = ensemble.storage.get('dropdownItems') || [];
                  const filteredItems = currentItems.filter(item => item.value !== 'newItem');
                  ensemble.storage.set('dropdownItems', filteredItems);
                `,
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Initial Items",
              onTap: {
                executeCode: `
                  ensemble.storage.set('dropdownItems', [
                    { label: 'Initial Item 1', value: 'initial1' },
                    { label: 'Initial Item 2', value: 'initial2' }
                  ]);
                `,
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const dropdown = screen.getByRole("combobox");
    const setInitialButton = screen.getByText("Set Initial Items");
    const addItemButton = screen.getByText("Add Item");
    const removeItemButton = screen.getByText("Remove Item");

    // Set initial items
    fireEvent.click(setInitialButton);

    // Open dropdown to see initial items
    userEvent.click(dropdown);
    await waitFor(() => {
      expect(screen.getByTitle("Initial Item 1")).toBeInTheDocument();
      expect(screen.getByTitle("Initial Item 2")).toBeInTheDocument();
    });

    // Close dropdown
    userEvent.click(dropdown);

    // Add a new item
    fireEvent.click(addItemButton);

    // Open dropdown to verify new item was added
    userEvent.click(dropdown);
    await waitFor(() => {
      expect(screen.getByTitle("Initial Item 1")).toBeInTheDocument();
      expect(screen.getByTitle("Initial Item 2")).toBeInTheDocument();
      expect(screen.getByTitle("New Item")).toBeInTheDocument();
    });

    // Close dropdown
    userEvent.click(dropdown);

    // Remove the new item
    fireEvent.click(removeItemButton);

    // Open dropdown to verify item was removed
    userEvent.click(dropdown);
    await waitFor(() => {
      expect(screen.getByTitle("Initial Item 1")).toBeInTheDocument();
      expect(screen.getByTitle("Initial Item 2")).toBeInTheDocument();
      expect(screen.queryByText("New Item")).not.toBeInTheDocument();
    });
  });
});
/* eslint-enable react/no-children-prop */
