import { findExpressions } from "../common";

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
    ["styles.names", "${'test ' + blah}"],
    ["styles.borderRadius", "${foo}"],
    ["styles.padding.1", "${baz}"],
    ["styles.padding.2.value", "${beef}"],
    ["styles.border", "${blah + ' xyz ' + foo}"],
    ["styles.borderColor", "${blah + ' ' + foo}"],
    ["value", "${bar}"],
  ]);
  /* eslint-enable no-template-curly-in-string */
});
