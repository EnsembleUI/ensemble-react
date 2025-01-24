/* eslint import/first: 0 */
const parseApplicationMock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import { render, screen, act } from "@testing-library/react";
import type { ApplicationDTO } from "@ensembleui/react-framework";
import { EnsembleApp } from "../EnsembleApp";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@ensembleui/react-framework", () => ({
  ...frameworkActual,
  EnsembleParser: {
    parseApplication: parseApplicationMock,
  },
}));

jest.mock("react-markdown", jest.fn());

global.Request = jest
  .fn()
  .mockImplementation((input: RequestInfo, init: RequestInit) => ({
    url: input,
    method: init.method || "GET",
    headers: init.headers || {},
    body: init.body || null,
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

afterEach(() => {
  // Reset the route or any global state here
  window.history.pushState({}, "", "/");
});

test("Renders error page", () => {
  /* eslint-disable no-console */
  const consoleErr = console.error;
  console.error = jest.fn();
  parseApplicationMock.mockReturnValue({
    home: {},
    screens: [],
    customWidgets: [],
    themes: {},
  });
  try {
    render(
      <EnsembleApp
        appId="test"
        application={{ icons: { mui: {} } } as ApplicationDTO}
      />,
    );
  } catch (e) {
    // no-op
  }

  console.error = consoleErr;
  /* eslint-enable no-console */
  expect(
    screen.getByText("Sorry, an unexpected error has occurred."),
  ).not.toBeNull();
});

test("Renders view widget of home screen", () => {
  const mockScreen = {
    name: "Home",
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
  };
  parseApplicationMock.mockReturnValue({
    home: mockScreen,
    screens: [mockScreen],
    customWidgets: [],
    themes: {},
  });
  render(
    <EnsembleApp
      appId="test"
      application={
        {
          screens: [{ content: "" }],
          icons: { mui: {} },
        } as ApplicationDTO
      }
    />,
  );

  expect(screen.getByText("Peter Parker")).not.toBeNull();
});

test("Bind data from other widgets", async () => {
  const mockScreen = {
    name: "ReadValue",
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
  };
  parseApplicationMock.mockReturnValue({
    home: mockScreen,
    screens: [mockScreen],
    customWidgets: [],
    themes: {},
  });
  render(
    <EnsembleApp
      appId="test"
      application={
        {
          screens: [{ content: "" }],
          icons: { mui: {} },
        } as ApplicationDTO
      }
    />,
  );

  const components = await screen.findAllByText("Peter Parker");
  expect(components.length).toEqual(2);
});

// FIXME: id collision in widget state here
test("Updates values through Ensemble state", async () => {
  const mockScreen = {
    name: "UpdateValue",
    body: {
      name: "Column",
      properties: {
        children: [
          {
            name: "Text",
            properties: {
              id: "myText2",
              text: "Peter Parker",
            },
          },
          {
            name: "Button",
            properties: {
              label: "Click Me",
              onTap: {
                executeCode: "myText2.setText('Spiderman')",
              },
            },
          },
        ],
      },
    },
  };
  parseApplicationMock.mockReturnValue({
    home: mockScreen,
    screens: [mockScreen],
    customWidgets: [],
    themes: {},
  });
  render(
    <EnsembleApp
      appId="test"
      application={
        {
          screens: [{ content: "" }],
          icons: { mui: {} },
        } as ApplicationDTO
      }
    />,
  );

  const button = screen.getByText("Click Me");
  expect(button).not.toBeNull();
  act(() => {
    button.click();
  });

  const updatedText = await screen.findByText("Spiderman");
  expect(updatedText).not.toBeNull();
});

test("Renders mui icon error", () => {
  const logSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());

  parseApplicationMock.mockReturnValue({
    home: {},
    screens: [],
    customWidgets: [],
    themes: {},
  });
  try {
    render(<EnsembleApp appId="test" application={{} as ApplicationDTO} />);
  } catch (e) {
    // no-op
  }

  expect(logSpy.mock.calls.toString()).toContain(
    "An mui icons must be provided",
  );
});
