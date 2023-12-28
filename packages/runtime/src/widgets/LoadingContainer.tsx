import type { EnsembleWidget, Expression } from "@ensembleui/react-framework";
import { unwrapWidget, useRegisterBindings } from "@ensembleui/react-framework";
import { Skeleton } from "@mui/material";
import type { EnsembleWidgetProps } from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import { WidgetRegistry } from "../registry";

export interface LoadingContainerProps extends EnsembleWidgetProps {
  isLoading: Expression<boolean>;
  useShimmer?: Expression<boolean>;
  baseColor?: Expression<string>;
  highlightColor?: Expression<string>;
  width?: Expression<number>;
  height?: Expression<number>;
  widget: EnsembleWidget;
  loadingWidget?: EnsembleWidget;
}

export const LoadingContainer: React.FC<LoadingContainerProps> = (props) => {
  const { widget, loadingWidget, ...rest } = props;
  const unwrappedWidget = unwrapWidget(
    widget as unknown as Record<string, unknown>,
  );
  const { values } = useRegisterBindings(rest, props.id);

  if (values?.isLoading) {
    if (loadingWidget) {
      return <>{EnsembleRuntime.render([loadingWidget])}</>;
    }
    return (
      <Skeleton
        animation={values.useShimmer ? "wave" : false}
        height={values.height}
        variant="rectangular"
        width={values.width}
      />
    );
  }

  return <>{EnsembleRuntime.render([unwrappedWidget])}</>;
};

WidgetRegistry.register("LoadingContainer", LoadingContainer);
