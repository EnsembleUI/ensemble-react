import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { WidgetRegistry } from "../registry";

test.skip("throws error if a widget is already registered with same name", () => {
  const register = (): void => {
    WidgetRegistry.register("test", () => null);
  };

  register();
  expect(register).toThrow();
});

test("returns unknown widget if widget is not registered", () => {
  render(<div>{WidgetRegistry.find("test2") as ReactElement}</div>);

  const element = screen.getByText("Unknown widget: test2");
  expect(element).not.toBeNull();
});
