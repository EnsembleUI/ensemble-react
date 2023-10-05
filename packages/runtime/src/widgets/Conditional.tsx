import type { Expression, ScreenContextDefinition } from "framework";
import { evaluate, unwrapWidget, useScreenContext } from "framework";
import { cloneDeep, head, isEmpty, last } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { useMemo } from "react";

type CondtionalElement = Record<Capitalize<string>, Record<string, unknown>> &
  (
    | { if: Expression<string>; elseif?: never; else?: never }
    | { elseif: Expression<string>; if?: never; else?: never }
    | { else: null; if?: never; elseif?: never }
  );

export interface ConditionalProps {
  conditions: CondtionalElement[];
}

export const Conditional: React.FC<ConditionalProps> = (props) => {
  const context = useScreenContext();

  const [isValid, errorMessage] = hasProperStructure(props.conditions);
  if (!isValid) throw Error(errorMessage);

  let element = props.conditions.find((condition) => {
    const conditionString = extractCondition(condition);
    if (typeof conditionString !== "string") return false;

    return evaluate(context as ScreenContextDefinition, conditionString);
  });

  if (!element) {
    // check if last condition is 'else'
    const lastCondition = last(props.conditions);
    if (lastCondition && "else" in lastCondition) element = lastCondition;
    // otherwise return empty fragment
    else return <></>;
  }

  const widget = useMemo(() => extractWidget(element!), [element]);

  return <>{EnsembleRuntime.render([widget])}</>;
};

WidgetRegistry.register("Conditional", Conditional);

export const hasProperStructure = (
  conditions: CondtionalElement[]
): [boolean, string] => {
  if (isEmpty(conditions) || !("if" in head(conditions)!))
    return [
      false,
      "Improper structure, make sure one 'if' condition is present",
    ];

  for (let index = 0; index < conditions.length; index++) {
    const condition = conditions[index];

    if (
      Object.entries(condition).length !== 2 ||
      ("if" in condition &&
        index > 0 &&
        ("elseif" in conditions[index - 1] ||
          "else" in conditions[index - 1])) ||
      ("elseif" in condition && index === 0) ||
      ("else" in condition && index !== conditions.length - 1)
    )
      return [
        false,
        "Improper structure, make sure every condition has valid structure",
      ];
  }

  return [true, ""];
};

export const extractWidget = (condition: CondtionalElement) => {
  for (const key in condition)
    if (key !== "if" && key !== "elseif" && key !== "else")
      return unwrapWidget({
        [key]: cloneDeep(condition[key as keyof typeof condition]),
      });

  throw Error("Improper structure, make sure every condition has a widget");
};

export const extractCondition = (condition: CondtionalElement) => {
  for (const key in condition)
    if (key === "if" || key === "elseif" || key === "else")
      return condition[key];

  throw Error("Improper structure, make sure every condition has a condition");
};
