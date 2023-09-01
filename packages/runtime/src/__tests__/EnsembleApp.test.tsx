/* eslint import/first: 0 */
const loadAppMock = jest.fn();
const parseScreenMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("framework");

import crypto from "node:crypto";
import { render, screen } from "@testing-library/react";
import { EnsembleApp } from "../EnsembleApp";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("framework", () => ({
  ...frameworkActual,
  ApplicationLoader: {
    load: loadAppMock,
  },
  EnsembleParser: {
    parseScreen: parseScreenMock,
  },
}));

window.crypto = {
  randomUUID: () => {
    return crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`;
  },
} as Crypto;

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

test("Updates values through Ensemble state", () => {
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
          {
            name: "Button",
            properties: {
              label: "Click Me",
            },
          },
        ],
      },
    },
  });
  render(<EnsembleApp appId="test" />);

  expect(screen.getByText("Click Me")).not.toBeNull();
});
