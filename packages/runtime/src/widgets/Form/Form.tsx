import type {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import type { EnsembleAction, EnsembleWidget } from "framework";
import { useCallback } from "react";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";

export interface FormProps {
  children: EnsembleWidget[];
  enabled: boolean;
  onSubmit?: EnsembleAction;
  styles: {
    labelPosition: "top" | "start" | "none";
    labelOverflow: "wrap" | "visible" | "clip" | "ellipsis";
  };
}
export const Form: React.FC<FormProps> = (props) => {
  const methods = useForm();
  const action = useEnsembleAction(props.onSubmit);

  const handleSubmit = useCallback<UseFormHandleSubmit<FieldValues>>(
    (onValidate) => {
      const validateWithAction: SubmitHandler<FieldValues> = (values) => {
        onValidate(values);
        if (!action) {
          return;
        }

        return action.callback();
      };
      return methods.handleSubmit(validateWithAction);
    },
    [action, methods],
  );

  return (
    <FormProvider {...methods} handleSubmit={handleSubmit}>
      <form>{EnsembleRuntime.render(props.children)}</form>
    </FormProvider>
  );
};

WidgetRegistry.register("Form", Form);
