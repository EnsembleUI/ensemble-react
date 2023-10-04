import { render, screen } from "@testing-library/react";
import {
  Conditional,
  ConditionalProps,
  hasProperStructure,
  extractWidget,
  extractCondition,
} from "../Conditional";
import "../index";

jest.mock("react-markdown", jest.fn());

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

    expect(() => extractCondition(condition as any)).toThrow();
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
