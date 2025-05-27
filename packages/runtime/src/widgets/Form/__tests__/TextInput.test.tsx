/* eslint-disable react/no-children-prop */
import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn);

  afterEach(() => {
    logSpy.mockClear();
  });

  test("allows numeric keys to be entered", async () => {
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

  test("allows numeric keys to be entered with decimal", async () => {
    render(
      <Form
        children={[...defaultFormContent, ...defaultFormButton]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "12.3" } });

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("12.3")).toBeVisible();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "12.3" }),
      );
    });
  });

  test("filter numeric keys to be entered", async () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              inputType: "number",
              label: "Number input",
              id: "numberInput",
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    userEvent.type(input, "Hello 123");

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "123" }),
      );
    });
  });

  test("filter numeric keys to be entered with decimal", async () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              inputType: "number",
              label: "Number input",
              id: "numberInput",
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    userEvent.type(input, "Hello 1.23");

    const getValueButton = screen.getByText("Get Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("1.23")).toBeVisible();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ numberInput: "1.23" }),
      );
    });
  });

  test("max number allow", async () => {
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

    const inputEl = screen.getByRole("textbox");
    fireEvent.change(inputEl, { target: { value: "user input" } });

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

  test("logs event object onKeyDown for numeric TextInput", async () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "Number input",
              id: "numberInput",
              type: "number",
              onKeyDown: {
                executeCode: "console.log(event)",
              },
            },
          },
          ...defaultFormButton,
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );
    const input = screen.getByLabelText("Number input");
    userEvent.type(input, "2");

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ key: "2" }),
      );
    });
  });

  test("debounces onChange events according to debounceMs", () => {
    jest.useFakeTimers();

    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "Debounced input",
              id: "debouncedInput",
              onChange: {
                debounceMs: 500,
                executeCode: "console.log('changed:', value)",
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const input = screen.getByLabelText("Debounced input");

    fireEvent.change(input, { target: { value: "test value" } });
    expect(logSpy).not.toHaveBeenCalledWith("changed:", "test value");

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(logSpy).not.toHaveBeenCalledWith("changed:", "test value");

    act(() => {
      jest.advanceTimersByTime(210);
    });
    expect(logSpy).toHaveBeenCalledWith("changed:", "test value");

    jest.useRealTimers();
  });

  test("cancels debounced onChange when component unmounts", () => {
    jest.useFakeTimers();

    const { unmount } = render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "Debounced input",
              id: "debouncedInput",
              onChange: {
                debounceMs: 500,
                executeCode: "console.log('unmount test:', value)",
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const input = screen.getByLabelText("Debounced input");

    fireEvent.change(input, { target: { value: "should be canceled" } });
    expect(logSpy).not.toHaveBeenCalledWith(
      "unmount test:",
      "should be canceled",
    );

    unmount(); // unmount the component before debounce completes

    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(logSpy).not.toHaveBeenCalledWith(
      "unmount test:",
      "should be canceled",
    );

    jest.useRealTimers();
  });
});
/* eslint-enable react/no-children-prop */
