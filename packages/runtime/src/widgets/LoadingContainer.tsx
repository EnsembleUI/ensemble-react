import type { Expression } from "@ensembleui/react-framework";
import { unwrapWidget, useRegisterBindings } from "@ensembleui/react-framework";
import { Skeleton } from "@mui/material";
import { cloneDeep } from "lodash-es";
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
  widget: { [key: string]: unknown };
  loadingWidget?: { [key: string]: unknown };
}

export const LoadingContainer: React.FC<LoadingContainerProps> = (props) => {
  const { widget, loadingWidget, ...rest } = props;
  const unwrappedWidget = unwrapWidget(cloneDeep(widget));
  const unwrappedLoadingWidget = loadingWidget
    ? unwrapWidget(cloneDeep(loadingWidget))
    : undefined;
  const { values } = useRegisterBindings(rest, props.id);

  if (values?.isLoading) {
    if (unwrappedLoadingWidget) {
      return <>{EnsembleRuntime.render([unwrappedLoadingWidget])}</>;
    }
    return (
      <Skeleton
        animation={values.useShimmer ? "wave" : false}
        height={values.height}
        style={values.styles}
        variant="rectangular"
        width={values.width}
      />
    );
  }

  return <>{EnsembleRuntime.render([unwrappedWidget])}</>;
};

WidgetRegistry.register("LoadingContainer", LoadingContainer);
