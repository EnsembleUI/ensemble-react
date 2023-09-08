/* eslint import/first: 0 */
const loadAppMock = jest.fn();
const parseScreenMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("framework");

import { render, screen, act } from "@testing-library/react";
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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

test("Renders error page", () => {
  loadAppMock.mockReturnValue({});
  parseScreenMock.mockReturnValue({});
  render(<EnsembleApp appId="test" />);

  expect(screen.getByText("Something went wrong:")).not.toBeNull();
});

test.skip("Renders view widget of home screen", () => {
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

test("Bind data from other widgets", () => {
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
              id: "myText",
              text: "Peter Parker",
            },
          },
          {
            name: "Text",
            properties: {
              // eslint-disable-next-line no-template-curly-in-string
              text: "${myText.text}",
            },
          },
        ],
      },
    },
  });
  render(<EnsembleApp appId="test" />);

  const components = screen.queryAllByText("Peter Parker");
  expect(components.length).toEqual(2);
});

test.skip("Updates values through Ensemble state", async () => {
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
              id: "myText",
              text: "Peter Parker",
            },
          },
          {
            name: "Button",
            properties: {
              label: "Click Me",
              onTap: {
                executeCode: "myText.setText('Spiderman')",
              },
            },
          },
        ],
      },
    },
  });
  render(<EnsembleApp appId="test" />);

  const button = screen.getByText("Click Me");
  expect(button).not.toBeNull();
  act(() => {
    button.click();
  });

  const updatedText = await screen.findByText("Spiderman");
  expect(updatedText).not.toBeNull();
});
