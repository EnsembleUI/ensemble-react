import { findExpressions, isCompoundExpression } from "../common";

test("find deeply nested expressions", () => {
  /* eslint-disable no-template-curly-in-string */
  const testObj = {
    styles: {
      names: "test ${blah}",
      borderRadius: "${foo}",
      padding: [0, "${baz}", { value: "${beef}" }],
      border: "${blah} xyz ${foo}",
      borderColor: "${blah} ${foo}",
    },
    value: "${bar}",
  };

  const expressionMap: string[][] = [];
  findExpressions(testObj, [], expressionMap);

  expect(expressionMap).toEqual([
    ["styles.names", "${`test ${blah}`}"],
    ["styles.borderRadius", "${foo}"],
    ["styles.padding.1", "${baz}"],
    ["styles.padding.2.value", "${beef}"],
    ["styles.border", "${`${blah} xyz ${foo}`}"],
    ["styles.borderColor", "${`${blah} ${foo}`}"],
    ["value", "${bar}"],
  ]);
  /* eslint-enable no-template-curly-in-string */
});

/* eslint-disable no-template-curly-in-string */
describe("isCompoundExpression", () => {
  test("Single placeholder with additional text", () => {
    expect(isCompoundExpression("${abc} xys")).toBe(true);
  });

  test("Single placeholder with no additional text", () => {
    expect(isCompoundExpression("${abc}")).toBe(false);
  });

  test("Multiple placeholders", () => {
    expect(isCompoundExpression("${abc} ${def}")).toBe(true);
  });

  test("Single complex placeholder with expression", () => {
    expect(isCompoundExpression("${abc + def}")).toBe(false);
  });

  test("Nested template literals (complex case)", () => {
    expect(
      isCompoundExpression(
        '${`interpolate ${ensemble.storage.get("yyy")} multiple times ${ensemble.storage.get("yyy")}`}',
      ),
    ).toBe(false);
  });

  test("No placeholders", () => {
    expect(isCompoundExpression("plain text")).toBe(false);
  });

  test("Placeholder at the start and end", () => {
    expect(isCompoundExpression("${start} text ${end}")).toBe(true);
  });

  test("Placeholder within text", () => {
    expect(isCompoundExpression("text ${placeholder} text")).toBe(true);
  });

  test("Nested placeholders", () => {
    expect(isCompoundExpression("${a${b}c}")).toBe(false);
  });

  test("Multiple placeholders with nested placeholders", () => {
    expect(isCompoundExpression("${a${b}c} ${d${e}f}")).toBe(true);
  });
});
/* eslint-enable no-template-curly-in-string */
