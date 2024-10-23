/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button, Form, Text } from "../../index";
import { FormTestWrapper } from "./__shared__/fixtures";

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

  test("update values", async () => {
    render(
      <>
        <Form children={defaultFormContent} id="form" />
        <Button
          label="Update"
          onTap={{ executeCode: 'form.updateValues({"Enter Text": "foo"})' }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );

    const resetButton = screen.getByText("Update");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("foo")).toBeInTheDocument();
    });
  });

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

  test("get current values", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <>
        <Form children={defaultFormContent} id="form" />
        <Button
          label="Values"
          onTap={{ executeCode: "console.log(form.getValues())" }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const textInput = screen.getByLabelText("Enter Text");
    fireEvent.change(textInput, { target: { value: "hello world" } });
    const valuesButton = screen.getByText("Values");
    fireEvent.click(valuesButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ "Enter Text": "hello world" }),
      );
    });
  });

  test("check if values are valid", async () => {
    render(
      <>
        <Form children={defaultFormContent} id="form" />
        <Button label="Validate" onTap={{ executeCode: "form.validate()" }} />
        {/* eslint-disable-next-line no-template-curly-in-string */}
        <Text text="${form.isValid}" />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );

    const validateBtn = screen.getByText("Validate");
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });

  test("check required error message with given label", async () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              label: "First name",
              required: true,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Submit",
              submitForm: true,
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const validateBtn = screen.getByText("Submit");
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText("Please enter First name")).toBeInTheDocument();
    });
  });

  test("check required error message without given label", async () => {
    render(
      <Form
        children={[
          {
            name: "TextInput",
            properties: {
              id: "firstName",
              required: true,
            },
          },
          {
            name: "Button",
            properties: {
              label: "Submit",
              submitForm: true,
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const validateBtn = screen.getByText("Submit");
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText("Please enter a value")).toBeInTheDocument();
    });
  });
});
/* eslint-enable react/no-children-prop */
