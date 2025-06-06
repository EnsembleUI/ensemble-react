import { evaluateDeep } from "../../evaluate";
import {
  deepCloneAsJSON,
  findExpressions,
  isCompoundExpression,
} from "../common";

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

  test("Complex expression with nested brackets", () => {
    expect(
      isCompoundExpression(
        "${[{ value: 'ledger', label: 'Ledger' }, ...getUser.body.data.userById.configurationType === 'BPO' ? [{ value: 'clientProductivity', label: 'Client Productivity' }] : [], { value: 'advocateProductivity', label: 'Advocate Productivity' }]}",
      ),
    ).toBe(false);
  });
});

describe("validate expressions", () => {
  test("Single placeholder with no additional text", () => {
    expect(
      evaluateDeep({ name: "${name}" }, undefined, {
        name: "Ensemble",
      }),
    ).toMatchObject({ name: "Ensemble" });
  });

  test("Single placeholder with additional text", () => {
    expect(
      evaluateDeep({ name: "${name} framework" }, undefined, {
        name: "Ensemble",
      }),
    ).toMatchObject({ name: "Ensemble framework" });
  });

  test("Multiple placeholders", () => {
    expect(
      evaluateDeep({ name: "${name} ${platform}" }, undefined, {
        name: "Ensemble",
        platform: "Web",
      }),
    ).toMatchObject({ name: "Ensemble Web" });
  });

  test("Single complex placeholder with expression", () => {
    expect(
      evaluateDeep({ name: "${name + platform}" }, undefined, {
        name: "Ensemble",
        platform: "Web",
      }),
    ).toMatchObject({ name: "EnsembleWeb" });
  });

  test("Nested template literals (complex case)", () => {
    expect(
      evaluateDeep(
        {
          name: "${`Ensemble ${platform} platform`}",
        },
        undefined,
        {
          name: "Ensemble",
          platform: "Web",
        },
      ),
    ).toMatchObject({ name: "Ensemble Web platform" });
  });

  test("No placeholders", () => {
    expect(
      evaluateDeep(
        {
          name: "Ensemble Web",
        },
        undefined,
        {
          name: "Ensemble",
          platform: "Web",
        },
      ),
    ).toMatchObject({ name: "Ensemble Web" });
  });

  test("Placeholder at the start and end", () => {
    expect(
      evaluateDeep(
        {
          name: "${name} Web ${platform}",
        },
        undefined,
        {
          name: "Ensemble",
          platform: "Studio",
        },
      ),
    ).toMatchObject({ name: "Ensemble Web Studio" });
  });

  test("Placeholder within text", () => {
    expect(
      evaluateDeep(
        {
          name: "Ensemble ${platform} Studio",
        },
        undefined,
        {
          name: "Ensemble",
          platform: "Web",
        },
      ),
    ).toMatchObject({ name: "Ensemble Web Studio" });
  });

  test("Map loop", () => {
    expect(
      evaluateDeep(
        {
          name: "${['X', 'Y'].map((c) => { return c.toLowerCase() })}",
        },
        undefined,
        {
          name: "Ensemble",
          platform: "Web",
        },
      ),
    ).toMatchObject({ name: ["x", "y"] });
  });
});

describe("deepCloneAsJSON", () => {
  it("should replace undefined values with null and deep clone the object", () => {
    const original = {
      a: 1,
      b: undefined,
      c: {
        d: "test",
        e: undefined,
      },
    };

    const expected = {
      a: 1,
      b: null,
      c: {
        d: "test",
        e: null,
      },
    };

    const result = deepCloneAsJSON(original);
    expect(result).toEqual(expected);
  });

  it("should handle arrays with undefined values correctly", () => {
    const original = [1, undefined, { a: undefined }];
    const expected = [1, null, { a: null }];

    const result = deepCloneAsJSON(original);
    expect(result).toEqual(expected);
  });

  it("should return an identical object when there are no undefined values", () => {
    const original = { a: 1, b: "test", c: [1, 2, 3] };

    const result = deepCloneAsJSON(original);
    expect(result).toEqual(original);
  });

  it("should handle null values correctly without altering them", () => {
    const original = { a: null, b: { c: null } };

    const result = deepCloneAsJSON(original);
    expect(result).toEqual(original);
  });

  it("should return null when the input is undefined", () => {
    const result = deepCloneAsJSON(undefined);
    expect(result).toBeNull();
  });

  it("should return null when the input is explicitly null", () => {
    const result = deepCloneAsJSON(null);
    expect(result).toBeNull();
  });
});
/* eslint-enable no-template-curly-in-string */
