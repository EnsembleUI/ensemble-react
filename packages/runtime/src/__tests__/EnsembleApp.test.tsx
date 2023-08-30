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

  expect(screen.getByText("Something went wrong:")).not.toBeNull();
});

test("Renders view widget of home screen", () => {
  loadAppMock.mockReturnValue({ screens: [{ content: "" }] });
  parseScreenMock.mockReturnValue({
    name: "test",
    body: {
      name: "Column",
      properties: {
        children: [
          {
            name: "Text",
            properties: {
              text: "Peter Parker",
            },
          },
        ],
      },
    },
  });
  render(<EnsembleApp appId="test" />);

  expect(screen.getByText("Peter Parker")).not.toBeNull();
});

test.todo("Renders remaining widgets");
