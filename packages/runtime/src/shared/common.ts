import type { EnsembleScreenModel } from "@ensembleui/react-framework";
import {
  evaluate,
  replace,
  visitExpressions,
} from "@ensembleui/react-framework";

export const evaluateInputs = (
  inputs: { [key: string]: unknown },
  model?: EnsembleScreenModel,
  context?: { [key: string]: unknown },
): { [key: string]: unknown } => {
  const resolvedInputs = visitExpressions(
    inputs,
    replace((expr) => evaluate({ model }, expr, context)),
  );
  return resolvedInputs as { [key: string]: unknown };
};
