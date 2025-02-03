/* eslint import/first: 0 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const framework = jest.requireActual("@ensembleui/react-framework");
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
const unwrapWidgetSpy = jest.fn().mockImplementation(framework.unwrapWidget);
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import type { ConditionalProps, ConditionalElement } from "../Conditional";
import {
  Conditional,
  hasProperStructure,
  extractWidget,
  extractCondition,
} from "../Conditional";
import "../index";
import { EnsembleScreen } from "../../runtime/screen";

jest.mock("react-markdown", jest.fn());

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@ensembleui/react-framework", () => ({
  ...framework,
  unwrapWidget: unwrapWidgetSpy,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("Conditional Component", () => {
  test('renders the widget when "if" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "true",
          Text: { text: "Widget A" },
        },
        {
          else: null,
          Text: { text: "Widget B" },
        },
      ],
    };

    render(<Conditional conditions={conditionalProps.conditions} />);
    expect(screen.getByText("Widget A")).not.toBeNull();
  });

  test('renders the widget when "elseif" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { text: "Widget A" },
        },
        {
          elseif: "true",
          Text: { text: "Widget B" },
        },
      ],
    };

    render(<Conditional conditions={conditionalProps.conditions} />);
    expect(screen.getByText("Widget B")).not.toBeNull();
  });

  test('renders the widget when "else" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { text: "Widget A" },
        },
        {
          else: null,
          Text: { text: "Widget C" },
        },
      ],
    };

    render(<Conditional conditions={conditionalProps.conditions} />);
    expect(screen.getByText("Widget C")).not.toBeNull();
  });

  test("renders nothing when no condition is met", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { text: "Widget A" },
        },
        {
          if: "false",
          Text: { text: "Widget AA" },
        },
      ],
    };

    render(<Conditional conditions={conditionalProps.conditions} />);
    expect(screen.queryByText("Widget A")).toBeNull();
  });
});

describe("hasProperStructure Function", () => {
  test("returns false for empty conditions", () => {
    const [isValid] = hasProperStructure([]);
    expect(isValid).toBe(false);
  });

  test("returns false for conditions without 'if' condition", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          elseif: "true",
          Text: { text: "Widget A" },
        },
        {
          else: null,
          Text: { text: "Widget B" },
        },
      ],
    };

    const [isValid] = hasProperStructure(conditionalProps.conditions);
    expect(isValid).toBe(false);
  });

  test("returns false when a condition does not have exactly two properties", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "true",
          Text: { text: "Widget A" },
          Text2: { text: "Widget B" },
        },
        {
          else: null,
        },
      ],
    };

    const [isValid] = hasProperStructure(conditionalProps.conditions);
    expect(isValid).toBe(false);
  });

  it('returns false when "if" condition(s) is(are) not the initial condition(s) following "elseif" or "else"', () => {
    const conditions = [
      {
        elseif: "false",
        Text: { text: "Widget A" },
      },
      {
        if: "true",
        Text: { text: "Widget B" },
      },
    ];

    const [isValid] = hasProperStructure(conditions);
    expect(isValid).toBe(false);
  });

  test("returns false for improper structure", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { text: "Widget A" },
        },
        {
          elseif: "true",
          Text: { text: "Widget B" },
        },
        {
          else: null,
          Text: { text: "Widget C" },
        },
        {
          else: null,
          Text: { text: "Widget D" },
        },
      ],
    };

    const [isValid] = hasProperStructure(conditionalProps.conditions);
    expect(isValid).toBe(false);
  });

  test("returns true for proper structure", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { text: "Widget A" },
        },
        {
          elseif: "true",
          Text: { text: "Widget B" },
        },
        {
          else: null,
          Text: { text: "Widget C" },
        },
      ],
    };

    const [isValid] = hasProperStructure(conditionalProps.conditions);
    expect(isValid).toBe(true);
  });
});

describe("extractWidget Function", () => {
  test("throws an error for improper structure", () => {
    const condition = {
      if: "true",
    };

    expect(() => extractWidget(condition)).toThrow();
  });

  test("extracts the correct widget", () => {
    const condition = {
      if: "true",
      Text: { text: "Widget A" },
    };

    const widget = extractWidget(condition);
    expect(widget).toEqual({ name: "Text", properties: { text: "Widget A" } });
  });
});

describe("extractCondition Function", () => {
  test("throws an error for improper structure", () => {
    const condition = {
      iff: "true",
      Text: { text: "Widget A" },
    };

    expect(() =>
      extractCondition(condition as unknown as ConditionalElement),
    ).toThrow();
  });

  test("extracts the correct condition", () => {
    const condition = {
      if: "1 === 1",
      Text: { text: "Widget A" },
    };

    const extractedCondition = extractCondition(condition);
    expect(extractedCondition).toBe("1 === 1");
  });
});

describe("conditional widget memoization", () => {
  it("should memoize branch widgets and prevent unnecessary re-renders", () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test_conditional",
          id: "test_conditional",
          body: {
            name: "Column",
            properties: {
              children: [
                {
                  name: "Conditional",
                  properties: {
                    conditions: [
                      {
                        if: `\${ensemble.storage.get('number') < 0}`,
                        Text: {
                          text: "Less than 0",
                        },
                      },
                      {
                        if: `\${ensemble.storage.get('number') === 0}`,
                        Text: {
                          text: "Equals to 0",
                        },
                      },
                      {
                        if: `\${ensemble.storage.get('number') > 0}`,
                        Text: {
                          text: "Greater than 0",
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Increase",
                    onTap: {
                      executeCode:
                        "ensemble.storage.set('number', ensemble.storage.get('number') + 1)",
                    },
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Decrease",
                    onTap: {
                      executeCode:
                        "ensemble.storage.set('number', ensemble.storage.get('number') - 1)",
                    },
                  },
                },
              ],
            },
          },
          onLoad: { executeCode: 'ensemble.storage.set("number", -1)' },
        }}
      />,
      {
        wrapper: BrowserRouter,
      },
    );

    expect(unwrapWidgetSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Less than 0")).not.toBeNull();

    fireEvent.click(screen.getByText("Increase"));
    expect(unwrapWidgetSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Equals to 0")).not.toBeNull();

    fireEvent.click(screen.getByText("Increase"));
    expect(unwrapWidgetSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Greater than 0")).not.toBeNull();

    fireEvent.click(screen.getByText("Decrease"));
    expect(unwrapWidgetSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Equals to 0")).not.toBeNull();

    fireEvent.click(screen.getByText("Decrease"));
    expect(unwrapWidgetSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Less than 0")).not.toBeNull();
  });
});
