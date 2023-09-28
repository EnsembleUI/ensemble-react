import { render } from "@testing-library/react";
import {
  Conditional,
  ConditionalProps,
  hasProperStructure,
  extractWidget,
  extractCondition,
} from "../Conditional";

describe("Conditional Component", () => {
  test('renders the widget when "if" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "true",
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget B" } },
        },
      ],
    };
    expect(() =>
      render(<Conditional conditions={conditionalProps.conditions} />)
    ).not.toThrow();
  });

  test('renders the widget when "elseif" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          elseif: "true",
          Text: { name: "Text", properties: { text: "Widget B" } },
        },
      ],
    };

    expect(() =>
      render(<Conditional conditions={conditionalProps.conditions} />)
    ).not.toThrow();
  });

  test('renders the widget when "else" condition is met', () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget C" } },
        },
      ],
    };

    expect(() =>
      render(<Conditional conditions={conditionalProps.conditions} />)
    ).not.toThrow();
  });

  test("renders nothing when no condition is met", () => {
    const conditionalProps: ConditionalProps = {
      conditions: [
        {
          if: "false",
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          if: "false",
          Text: { name: "Text", properties: { text: "Widget AA" } },
        },
      ],
    };

    expect(() =>
      render(<Conditional conditions={conditionalProps.conditions} />)
    ).not.toThrow();
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
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget B" } },
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
          Text: { name: "Text", properties: { text: "Widget A" } },
          Text2: { name: "Text", properties: { text: "Widget B" } },
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
        Text: { name: "Text", properties: { text: "Widget A" } },
      },
      {
        if: "true",
        Text: { name: "Text", properties: { text: "Widget B" } },
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
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          elseif: "true",
          Text: { name: "Text", properties: { text: "Widget B" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget C" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget D" } },
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
          Text: { name: "Text", properties: { text: "Widget A" } },
        },
        {
          elseif: "true",
          Text: { name: "Text", properties: { text: "Widget B" } },
        },
        {
          else: null,
          Text: { name: "Text", properties: { text: "Widget C" } },
        },
      ],
    };

    const [isValid] = hasProperStructure(conditionalProps.conditions);
    expect(isValid).toBe(true);
  });
});

describe("extractWidget Function", () => {
  it("throws an error for improper structure", () => {
    const condition = {
      if: "true",
    };

    expect(() => extractWidget(condition)).toThrow();
  });

  it("extracts the correct widget", () => {
    const condition = {
      if: "true",
      Text: { name: "Text", properties: { text: "Widget A" } },
    };

    const widget = extractWidget(condition);
    expect(widget.name).toBe("Text");
  });
});

describe("extractCondition Function", () => {
  it("throws an error for improper structure", () => {
    const condition = {
      iff: "true",
      Text: { name: "Text", properties: { text: "Widget A" } },
    };

    expect(() => extractCondition(condition as any)).toThrow();
  });

  it("extracts the correct condition", () => {
    const condition = {
      if: "1 === 1",
      Text: { name: "Text", properties: { text: "Widget A" } },
    };

    const extractedCondition = extractCondition(condition);
    expect(extractedCondition).toBe("1 === 1");
  });
});
