/* eslint import/first: 0 */
const loadAppMock = jest.fn();
const parseScreenMock = jest.fn();

import { render, screen } from "@testing-library/react";
import { EnsembleApp } from "../EnsembleApp";

jest.mock("framework", () => ({
  ApplicationLoader: {
    load: loadAppMock,
  },
  EnsembleParser: {
    parseScreen: parseScreenMock,
  },
}));

test("Renders error page", () => {
  loadAppMock.mockReturnValue({});
  parseScreenMock.mockReturnValue({});
  render(<EnsembleApp appId="test" />);

  expect(screen.getByText("test")).not.toBeNull();
});

test.todo("Renders view widget of home screen");

test.todo("Renders remaining widgets");
