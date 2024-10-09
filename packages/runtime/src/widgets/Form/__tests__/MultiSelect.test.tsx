/* eslint-disable react/no-children-prop */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { Form, Button } from "../../index";

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

describe("MultiSelect Widget", () => {
  test("initializes with a binding value", async () => {
    const logSpy = jest.spyOn(console, "log");
    render(
      <>
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
                value: ["option2", "option4"],
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

    const getValueButton = screen.getByText("Check value");
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ multiSelect: ["option2", "option4"] }),
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
          {
            name: "Button",
            properties: {
              label: "Check value",
              onTap: { executeCode: "console.log(form.getValues())" },
            },
          },
        ]}
        id="form"
      />,
      {
        wrapper: FormTestWrapper,
      },
    );

    const setValueButton = screen.getByText("Set value");
    const getValueButton = screen.getByText("Check value");
    fireEvent.click(setValueButton);
    fireEvent.click(getValueButton);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ multiSelect: ["option1", "option3"] }),
      );
    });
  });
});
/* eslint-enable react/no-children-prop */
