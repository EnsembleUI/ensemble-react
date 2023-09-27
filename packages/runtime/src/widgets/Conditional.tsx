import { Expression, Widget, useExecuteCode } from "framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { handleCurlyBraces } from "../util/utils";
import { head, isEmpty, last } from "lodash-es";

type CondtionalElement = Record<Capitalize<string>, Widget> &
  (
    | { if: Expression<string>; elseif?: never; else?: never }
    | { elseif: Expression<string>; if?: never; else?: never }
    | { else: null; if?: never; elseif?: never }
  );

export type ConditionalProps = {
  conditions: CondtionalElement[];
};

export const Conditional: React.FC<ConditionalProps> = (props) => {
  const [isValid, errorMessage] = hasProperStructure(props.conditions);
  if (!isValid) throw Error(errorMessage);

  let element = head(
    props.conditions.filter((condition) => {
      let conditionString = extractCondition(condition);
      if (typeof conditionString !== "string") return false;

      conditionString = handleCurlyBraces(conditionString);
      const evaluate = useExecuteCode(conditionString);
      return evaluate();
    })
  );

  if (!element) {
    // check if last condition is 'else'
    const lastCondition = last(props.conditions);
    if (lastCondition && lastCondition.hasOwnProperty("else"))
      element = lastCondition;
    // otherwise return empty fragment
    else return <></>;
  }

  const widget = extractWidget(element);

  return <>{EnsembleRuntime.render([widget])}</>;
};

WidgetRegistry.register("Conditional", Conditional);

const hasProperStructure = (
  conditions: CondtionalElement[]
): [boolean, string] => {
  if (
    !conditions ||
    isEmpty(conditions) ||
    !head(conditions)?.hasOwnProperty("if") ||
    conditions.filter((condition) => condition.hasOwnProperty("if")).length > 1
  )
    return [
      false,
      "Improper structure, make sure one 'if' condition is present",
    ];

  for (let index = 0; index < conditions.length; index++) {
    const condition = conditions[index];

    if (
      Object.entries(condition).length !== 2 ||
      (condition.hasOwnProperty("elseif") && index === 0) ||
      (condition.hasOwnProperty("else") && index !== conditions.length - 1)
    )
      return [
        false,
        "Improper structure, make sure every condition has valid structure",
      ];
  }

  return [true, ""];
};

const extractWidget = (condition: CondtionalElement) => {
  for (const key in condition) {
    if (key !== "if" && key !== "elseif" && key !== "else")
      return {
        name: key,
        properties: condition[key as keyof typeof condition] as {},
      } as Widget;
  }
  throw Error("Improper structure, make sure every condition has a widget");
};

const extractCondition = (condition: CondtionalElement) => {
  for (const key in condition) {
    if (key === "if" || key === "elseif" || key === "else")
      return condition[key];
  }
};
