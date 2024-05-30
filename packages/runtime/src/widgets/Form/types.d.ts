import type { Expression } from "@ensembleui/react-framework";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";

export type FormInputProps<T> = EnsembleWidgetProps & {
  value?: Expression<T>;
  initialValue?: Expression<T>;
  label: Expression<string>;
  hintText?: Expression<string>;
  required?: Expression<boolean>;
  enabled?: Expression<boolean>;
  labelStyle?: EnsembleWidgetStyles;
  validateOnUserInteraction?: Expression<boolean>;
};
