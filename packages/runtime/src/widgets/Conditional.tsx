import type { Expression } from "@ensembleui/react-framework";
import { unwrapWidget, useRegisterBindings } from "@ensembleui/react-framework";
import { cloneDeep, head, isEmpty, last } from "lodash-es";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleWidgetProps } from "../shared/types";

const widgetName = "Conditional";

export type ConditionalElement = Record<
  Capitalize<string>,
  Record<string, unknown>
> &
  (
    | { if: Expression<boolean>; elseif?: never; else?: never }
    | { elseif: Expression<boolean>; if?: never; else?: never }
    | { else: null; if?: never; elseif?: never }
  );

export interface ConditionalProps extends EnsembleWidgetProps {
  conditions: ConditionalElement[];
}

export const Conditional: React.FC<ConditionalProps> = ({
  conditions,
  ...props
}) => {
  const matched = useRef<{ [key: string]: ReactNode[] }>({});
  const [isValid, errorMessage] = hasProperStructure(conditions);
  if (!isValid) throw Error(errorMessage);

  const conditionStatements = useMemo(
    () => conditions.map(extractCondition),
    [conditions],
  );

  const { values } = useRegisterBindings(
    { conditions: conditionStatements, ...props, widgetName },
    props.id,
  );

  let trueIndex = values?.conditions.findIndex((conditionValue) => {
    return conditionValue === "true" || conditionValue === true;
  });

  if (trueIndex === undefined || trueIndex < 0) {
    // check if last condition is 'else'
    const lastCondition = last(conditions);
    if (lastCondition && "else" in lastCondition)
      trueIndex = conditions.length - 1;
    // otherwise return empty fragment
  }

  const widget = useMemo(() => {
    if (trueIndex === undefined || trueIndex < 0) {
      return null;
    }
    const key = conditionStatements[trueIndex]?.toString();

    if (key && matched.current[key]) {
      return matched.current[key];
    }

    const extractedWidget = extractWidget(conditions[trueIndex]);

    const renderWidget = EnsembleRuntime.render([{ ...extractedWidget, key }]);

    if (key && !matched.current[key]) {
      matched.current[key] = renderWidget;
    }
    return renderWidget;
  }, [conditionStatements, conditions, trueIndex]);

  if (!widget) {
    return null;
  }

  return <>{widget}</>;
};

WidgetRegistry.register(widgetName, Conditional);

export const hasProperStructure = (
  conditions: ConditionalElement[],
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

export const extractWidget = (condition: ConditionalElement) => {
  for (const key in condition)
    if (key !== "if" && key !== "elseif" && key !== "else")
      return unwrapWidget({
        [key]: cloneDeep(condition[key as keyof typeof condition]),
      });

  throw Error("Improper structure, make sure every condition has a widget");
};

export const extractCondition = (condition: ConditionalElement) => {
  for (const key in condition)
    if (key === "if" || key === "elseif" || key === "else")
      return condition[key];

  throw Error("Improper structure, make sure every condition has a condition");
};
