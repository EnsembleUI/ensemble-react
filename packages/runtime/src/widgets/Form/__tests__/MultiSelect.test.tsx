/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Form } from "../../index";
import { FormTestWrapper } from "./__shared__/fixtures";
import { EnsembleScreen } from "../../../runtime/screen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface BrowserRouterProps {
  children: ReactNode;
}

const BrowserRouterWrapper = ({ children }: BrowserRouterProps) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

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

  test("multiselect with search action", async () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test_cache",
          id: "test_cache",
          onLoad: {
            executeCode: {
              body: `
                ensemble.storage.set('test_list_options', [
                  { label: 'William Smith', value: 'william_smith' },
                  { label: 'Evelyn Johnson', value: 'evelyn_johnson' },
                  { label: 'Liam Brown', value: 'liam_brown' },
                  { label: 'Bella Davis', value: 'bella_davis' },
                  { label: 'James Wilson', value: 'james_wilson' },
                  { label: 'Zachary Taylor', value: 'zachary_taylor' },
                  { label: 'Nolan Martinez', value: 'nolan_martinez' },
                  { label: 'Emma Thompson', value: 'emma_thompson' },
                  { label: 'Oliver White', value: 'oliver_white' },
                  { label: 'Sophia Lee', value: 'sophia_lee' },
                ])
                ensemble.storage.set('test_options', [])
              `,
            },
          },
          body: {
            name: "Button",
            properties: {
              label: "Show Dialog",
              onTap: {
                showDialog: {
                  widget: {
                    Column: {
                      children: [
                        {
                          Text: { text: "This is modal" },
                        },
                        {
                          MultiSelect: {
                            data: `\${ensemble.storage.get('test_options')}`,
                            labelKey: "label",
                            valueKey: "value",
                            value: `\${ensemble.storage.get('test_select') || []}`,
                            onChange: {
                              executeCode: `
                              ensemble.storage.set('test_select', option)
                              console.log('test_select', ensemble.storage.get('test_select'))
                              `,
                            },
                            onSearch: {
                              executeCode: `
                                const tempOptions = ensemble.storage.get('test_list_options')
                                const filteredResult = tempOptions.filter(option => 
                                  option.label.toLowerCase().startsWith(search.toLowerCase())
                                )
                                ensemble.storage.set('test_options', filteredResult)
                              `,
                            },
                          },
                        },
                        {
                          Button: {
                            label: "Close modal",
                            onTap: {
                              executeCode: "ensemble.closeAllDialogs()",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        }}
      />,
      { wrapper: BrowserRouterWrapper },
    );

    const option = { selector: ".ant-select-item-option-content" };
    const selected = { selector: ".ant-select-selection-item-content" };

    userEvent.click(screen.getByText("Show Dialog"));

    await waitFor(() => {
      expect(screen.getByText("This is modal")).toBeInTheDocument();
    });

    userEvent.type(screen.getByRole("combobox"), "Bella");

    await waitFor(() => {
      expect(screen.getByText("Bella Davis", option)).toBeInTheDocument();
    });

    userEvent.click(screen.getByText("Bella Davis", option));

    await waitFor(() => {
      expect(screen.getByText("Bella Davis", selected)).toBeVisible();
    });

    userEvent.click(screen.getByText("Close modal"));

    // Open 2nd time to check if the selected values are retained

    userEvent.click(screen.getByText("Show Dialog"));

    userEvent.type(screen.getByRole("combobox"), "Sophia");

    await waitFor(() => {
      expect(screen.getByText("Sophia Lee", option)).toBeInTheDocument();
    });

    userEvent.click(screen.getByText("Sophia Lee", option));

    await waitFor(() => {
      expect(screen.queryByText("Bella Davis", selected)).toBeVisible();
      expect(screen.queryByText("Sophia Lee", selected)).toBeVisible();
    });

    userEvent.click(screen.getByText("Close modal"));

    // Open 3rd time to check if the selected values are retained

    userEvent.click(screen.getByText("Show Dialog"));

    await waitFor(() => {
      expect(screen.queryByText("Bella Davis", selected)).toBeVisible();
      expect(screen.queryByText("Sophia Lee", selected)).toBeVisible();
    });
  }, 20000);
});
/* eslint-enable react/no-children-prop */
