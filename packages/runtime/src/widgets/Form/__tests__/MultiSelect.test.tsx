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

    const selector = ".ant-select-selection-item-content";

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 2", { selector })).toBeVisible();
      expect(screen.getByText("Option 4", { selector })).toBeVisible();
    });

    fireEvent.click(screen.getByText("change bindings"));

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 1", { selector })).toBeVisible();
      expect(screen.getByText("Option 3", { selector })).toBeVisible();
    });
  });

  test("supports object values in multiselect widget", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "objectInput",
              label: "Choose Option",
              labelKey: "firstName",
              valueKey: "email",
              data: [
                {
                  firstName: "Emily",
                  email: "emily.johnson@x.dummyjson.com",
                  gender: "female",
                  age: 28,
                },
                {
                  firstName: "Michael",
                  email: "michael.williams@x.dummyjson.com",
                  gender: "male",
                  age: 35,
                },
                {
                  firstName: "Sophia",
                  email: "sophia.brown@x.dummyjson.com",
                  gender: "female",
                  age: 42,
                },
                {
                  firstName: "James",
                  email: "james.davis@x.dummyjson.com",
                  gender: "male",
                  age: 45,
                },
                {
                  firstName: "Emma",
                  email: "emma.miller@x.dummyjson.com",
                  gender: "female",
                  age: 30,
                },
              ],
              value: `\${ensemble.storage.get('input')}`,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set Values",
              onTap: {
                executeCode: `ensemble.storage.set("input", [{
                  firstName: "Emma",
                  email: "emma.miller@x.dummyjson.com",
                  gender: "female",
                  age: 30,
            },{
                  firstName: "Michael",
                  email: "michael.williams@x.dummyjson.com",
                  gender: "male",
                  age: 35,
            }])`,
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Get Values",
              onTap: {
                executeCode: `console.log(objectInput.value)`,
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const selector = ".ant-select-selection-item-content";

    await waitFor(() => {
      userEvent.click(screen.getByRole("combobox"));
      userEvent.click(screen.getByTitle("Emily"));
      userEvent.click(screen.getByTitle("Sophia"));
      userEvent.click(screen.getByRole("combobox"));
    });

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Emily", { selector })).toBeVisible();
      expect(screen.getByText("Sophia", { selector })).toBeVisible();
    });

    fireEvent.click(screen.getByText("Set Values"));

    await waitFor(() => {
      expect(screen.getByText("Emma", { selector })).toBeVisible();
      expect(screen.getByText("Michael", { selector })).toBeVisible();
    });

    fireEvent.click(screen.getByText("Get Values"));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining([
          {
            firstName: "Emma",
            email: "emma.miller@x.dummyjson.com",
            gender: "female",
            age: 30,
          },
          {
            firstName: "Michael",
            email: "michael.williams@x.dummyjson.com",
            gender: "male",
            age: 35,
          },
        ]),
      );
    });
  });

  test("supports search in multiselect widget", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "searchInput",
              label: "Choose Option",
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const selector = ".ant-select-item-option-content";

    userEvent.click(screen.getByRole("combobox"));
    userEvent.type(document.querySelector("input") as HTMLElement, "Option 4");

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 4", { selector })).toBeVisible();
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 3")).not.toBeInTheDocument();
    });
  });

  test("supports on search action callback in multiselect widget", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "searchInput",
              label: "Choose Option",
              data: `\${ensemble.storage.get('options')}`,
              onSearch: {
                executeCode: `
                      const list = ensemble.storage.get('list') || [];
                      const filtered = list.filter((option) => option?.label
                        ?.toString()
                        ?.toLowerCase()
                        ?.startsWith(search.toLowerCase()));
                      ensemble.storage.set('options', filtered)
                      `,
              },
            },
          },
          {
            name: "Button",
            properties: {
              label: "Set value",
              onTap: {
                executeCode: `
                  const options = [
                      { label: "Option 1", value: "option1" },
                      { label: "Option 2", value: "option2" },
                      { label: "Option 3", value: "option3" },
                      { label: "Option 4", value: "option4" },
                      { label: "Option 44", value: "option44" },
                    ];
                  ensemble.storage.set("options", options);
                  ensemble.storage.set("list", options);
              `,
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const selector = ".ant-select-item-option-content";

    const setValueButton = screen.getByText("Set value");
    fireEvent.click(setValueButton);

    userEvent.click(screen.getByRole("combobox"));
    userEvent.type(document.querySelector("input") as HTMLElement, "Option 4");

    // Wait for the combobox to reflect the selected values
    await waitFor(() => {
      expect(screen.getByText("Option 4", { selector })).toBeVisible();
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 3")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 44", { selector })).toBeVisible();
    });
  });

  test("respects maxCount limit when selecting options", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "multiSelect",
              label: "Choose Option",
              maxCount: 2,
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const getValueButton = screen.getByText("Get Value");

    userEvent.click(screen.getByRole("combobox"));
    userEvent.click(screen.getByTitle("Option 1"));
    userEvent.click(screen.getByTitle("Option 2"));

    // should not be selectable
    userEvent.click(screen.getByTitle("Option 3"));

    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ multiSelect: ["option1", "option2"] }),
      );
    });
  });

  test("displays correct number of tags based on maxTagCount", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "multiSelect",
              label: "Choose Option",
              maxTagCount: 1,
              data: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
                { label: "Option 4", value: "option4" },
              ],
              value: `\${["option1", "option2", "option3", "option4"]}`,
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("+ 3 ...")).toBeInTheDocument();

      expect(screen.queryByText("Option 2")).toBeNull();
      expect(screen.queryByText("Option 3")).toBeNull();
      expect(screen.queryByText("Option 4")).toBeNull();
    });
  });

  test("truncates tag text according to maxTagTextLength", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "multiSelect",
              label: "Choose Option",
              maxTagTextLength: 6,
              data: [
                { label: "Very Long Option One", value: "option1" },
                { label: "Another Long Option", value: "option2" },
              ],
              value: `\${["option1", "option2"]}`,
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    await waitFor(() => {
      expect(screen.getByText("Very L...")).toBeInTheDocument();
      expect(screen.getByText("Anothe...")).toBeInTheDocument();
    });
  });

  test("supports item-template for custom option rendering", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "templateMultiSelect",
              label: "Choose User",
              "item-template": {
                data: [
                  {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "admin",
                  },
                  {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    role: "user",
                  },
                  {
                    id: 3,
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    role: "moderator",
                  },
                ],
                name: "user",
                value: `\${user.id}`,
                template: {
                  name: "Column",
                  properties: {
                    children: [
                      {
                        name: "Text",
                        properties: {
                          text: `\${user.name}`,
                          styles: {
                            fontWeight: "bold",
                          },
                        },
                      },
                      {
                        name: "Text",
                        properties: {
                          text: `\${user.email}`,
                          styles: {
                            fontSize: 12,
                            color: "gray",
                          },
                        },
                      },
                    ],
                  },
                },
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

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    userEvent.click(screen.getByText("John Doe"));
    userEvent.click(screen.getByText("Jane Smith"));

    userEvent.click(screen.getByRole("combobox"));

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ templateMultiSelect: [1, 2] }),
      );
    });
  });

  test("supports item-template with initial selected values", async () => {
    render(
      <Form
        children={[
          {
            name: "MultiSelect",
            properties: {
              id: "templateMultiSelectWithInitial",
              label: "Choose User",
              value: `\${[2, 3]}`, // pre-select Jane and Bob
              "item-template": {
                data: [
                  {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "admin",
                  },
                  {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    role: "user",
                  },
                  {
                    id: 3,
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    role: "moderator",
                  },
                ],
                name: "user",
                value: `\${user.id}`,
                template: {
                  name: "Column",
                  properties: {
                    children: [
                      {
                        name: "Text",
                        properties: {
                          text: `\${user.name} (\${user.role})`,
                        },
                      },
                      { name: "Text", properties: { text: `\${user.email}` } },
                    ],
                  },
                },
              },
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
        expect.objectContaining({ templateMultiSelectWithInitial: [2, 3] }),
      );
    });

    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      const johnDoeOptions = screen.getAllByText("john@example.com");
      const janeSmithOptions = screen.getAllByText("Jane Smith (user)");
      const bobJohnsonOptions = screen.getAllByText("Bob Johnson (moderator)");

      expect(johnDoeOptions.length).toBeGreaterThan(0);
      expect(janeSmithOptions.length).toBeGreaterThan(0);
      expect(bobJohnsonOptions.length).toBeGreaterThan(0);
    });
  });
});
/* eslint-enable react/no-children-prop */
