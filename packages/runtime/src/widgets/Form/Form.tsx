import { FormProvider, useForm } from "react-hook-form";
import type { EnsembleAction, EnsembleWidget } from "framework";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";

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
  // eslint-disable-next-line no-console
  const onSubmit = (data: unknown) => console.log(data);

  return (
    <FormProvider {...methods}>
      <form onSubmit={() => methods.handleSubmit(onSubmit)}>
        {EnsembleRuntime.render(props.children)}
      </form>
    </FormProvider>
  );
};

WidgetRegistry.register("Form", Form);
