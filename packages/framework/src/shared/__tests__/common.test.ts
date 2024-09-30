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

  const expressionMap: [string, string, object][] = [];
  findExpressions(testObj, [], expressionMap);

  expect(expressionMap).toEqual([
    ["styles.names", "${`test ${blah}`}", testObj.styles],
    ["styles.borderRadius", "${foo}", testObj.styles],
    ["styles.padding.1", "${baz}", testObj.styles.padding],
    ["styles.padding.2.value", "${beef}", testObj.styles.padding[2]],
    ["styles.border", "${`${blah} xyz ${foo}`}", testObj.styles],
    ["styles.borderColor", "${`${blah} ${foo}`}", testObj.styles],
    ["value", "${bar}", testObj],
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

  test("Complex expression with nested brackets", () => {
    expect(
      isCompoundExpression(
        "${[{ value: 'ledger', label: 'Ledger' }, ...getUser.body.data.userById.configurationType === 'BPO' ? [{ value: 'clientProductivity', label: 'Client Productivity' }] : [], { value: 'advocateProductivity', label: 'Advocate Productivity' }]}",
      ),
    ).toBe(false);
  });
});
/* eslint-enable no-template-curly-in-string */
