import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Skeleton as MuiSkeleton } from "@mui/material";
import type { EnsembleWidgetProps } from "../shared/types";
import { WidgetRegistry } from "../registry";

const widgetName = "Skeleton";

export interface SkeletonProps extends EnsembleWidgetProps {
  useShimmer?: Expression<boolean>;
  variant?: "circular" | "rectangular" | "rounded" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { values } = useRegisterBindings({ ...props, widgetName }, props.id);

  return (
    <MuiSkeleton
      animation={values?.useShimmer ? "wave" : false}
      height={values?.styles?.height}
      style={values?.styles}
      variant={values?.variant ?? "rectangular"}
      width={values?.styles?.width}
    />
  );
};

WidgetRegistry.register(widgetName, Skeleton);
WidgetRegistry.register("Shape", Skeleton);
