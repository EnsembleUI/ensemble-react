import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Skeleton as MuiSkeleton } from "@mui/material";
import type { EnsembleWidgetProps } from "../shared/types";
import { WidgetRegistry } from "../registry";

export interface SkeletonProps extends EnsembleWidgetProps {
  useShimmer?: Expression<boolean>;
}

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { values } = useRegisterBindings(props, props.id);

  return (
    <MuiSkeleton
      animation={values?.useShimmer ? "wave" : false}
      height={values?.styles?.height}
      style={values?.styles}
      variant="rectangular"
      width={values?.styles?.width}
    />
  );
};

WidgetRegistry.register("Skeleton", Skeleton);
