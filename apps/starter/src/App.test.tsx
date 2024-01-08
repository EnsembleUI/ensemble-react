import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Ensemble app id", () => {
  render(<App />);
  const defaultElement = screen.getByText("Something went wrong:");
  expect(defaultElement).toBeInTheDocument();
});
