/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { ScreenContextProvider } from "@ensembleui/react-framework";
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
      label: "Number input",
      id: "numberInput",
    },
  },
];

describe("TextInput", () => {
  test("allows numeric keys to be entered", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <>
        <Form children={defaultFormContent} id="form" />
        <Button
          label="Check value"
          onTap={{
            executeCode: "console.log(form.getValues())",
          }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "123" } });

    const getValueButton = screen.getByText("Check value");
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
      <>
        <Form children={defaultFormContent} id="form" />
        <Button
          label="Check value"
          onTap={{
            executeCode: "console.log(form.getValues())",
          }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "Hello 123" } });

    const getValueButton = screen.getByText("Check value");
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
      <>
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
          ]}
          id="form"
        />
        <Button
          label="Check value"
          onTap={{
            executeCode: "console.log(form.getValues())",
          }}
        />
      </>,
      {
        wrapper: FormTestWrapper,
      },
    );
    const input = screen.getByLabelText("Number input");
    fireEvent.change(input, { target: { value: "123456" } });

    const getValueButton = screen.getByText("Check value");
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
              id: "textInput",
              label: "Text Input",
              value: "ensemble",
            },
          },
          {
            name: "Button",
            properties: {
              label: "Check Value",
              onTap: {
                executeCode: "console.log(form.getValues())",
              },
            },
          },
        ]}
        id="form"
      />,
      { wrapper: FormTestWrapper },
    );

    const getValueButton = screen.getByText("Check Value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
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
          {
            name: "Button",
            properties: {
              label: "Check Value",
              onTap: {
                executeCode: "console.log(form.getValues())",
              },
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const setValueButton = screen.getByText("Set Value");
    const getValueButton = screen.getByText("Check Value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ textInput: "ensemble" }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
