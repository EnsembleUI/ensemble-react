/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { Button, Form } from "../../index";

const FormTestWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <ScreenContextProvider
        screen={{
          id: "formTest",
          name: "formTest",
          body: { name: "Column", properties: {} },
        }}
      >
        {children}
      </ScreenContextProvider>
    </BrowserRouter>
  );
};

const defaultFormContent = [
  {
    name: "TextInput",
    properties: {
      label: "Enter Text",
    },
  },
  {
    name: "Date",
    properties: {
      label: "Enter Date",
    },
  },
  {
    name: "Checkbox",
    properties: {
      label: "Enter Checkbox",
    },
  },
  {
    name: "Dropdown",
    properties: {
      label: "Select One",
    },
  },
  {
    name: "Button",
    properties: {
      label: "Submit",
      submitForm: true,
    },
  },
];

describe("Form", () => {
  test("render a form with no initial values", () => {
    render(<Form children={defaultFormContent} />, {
      wrapper: FormTestWrapper,
    });

    expect(screen.getByLabelText("Enter Text")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
  test("render a form with initial values", () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "First Name",
              value: "Charles",
            },
          },
        ]}
        enabled
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    expect(screen.getByDisplayValue("Charles")).toBeInTheDocument();
  });
  test("can submit", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <Form
        children={defaultFormContent}
        onSubmit={{ executeCode: "console.log(vals)" }}
      />,
      {
        wrapper: FormTestWrapper,
      },
    );
    const textInput = screen.getByLabelText("Enter Text");
    fireEvent.change(textInput, { target: { value: "hello world" } });
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hello world")).toBeInTheDocument();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ "Enter Text": "hello world" }),
      );
    });
  });
  test("reset values to initial values", async () => {
    render(
      <>
        <Form
          children={[
            {
              name: "TextInput",
              properties: {
                label: "Enter Text",
                value: "foobar",
              },
            },
          ]}
          id="form"
        />
        <Button label="Reset" onTap={{ executeCode: "form.reset()" }} />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const textInput = screen.getByLabelText("Enter Text");
    fireEvent.change(textInput, { target: { value: "hello world" } });
    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("foobar")).toBeInTheDocument();
    });
  });
  test.todo("update values");
  test("clear values", async () => {
    render(
      <>
        <Form
          children={[
            {
              name: "TextInput",
              properties: {
                label: "Enter Text",
                value: "foobar",
              },
            },
          ]}
          id="form"
        />
        <Button label="Clear" onTap={{ executeCode: "form.clear()" }} />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const resetButton = screen.getByText("Clear");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.queryAllByDisplayValue("foobar").length).toBe(0);
    });
  });
  test.todo("get current values");
  test.todo("validate current values");
  test.todo("check if values are valid");
});
/* eslint-enable react/no-children-prop */
