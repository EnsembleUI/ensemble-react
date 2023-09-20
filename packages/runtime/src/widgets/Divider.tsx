import { WidgetRegistry } from "../registry";
import { Divider as AntdDivider } from "antd";

import "./index.css";

export type DividerProps = {
  dashed?: boolean;
  orientation?: "left" | "right" | "center";
  orientationMargin?: string | number;
  plain?: boolean;
  type?: "horizontal" | "vertical";
  text?: string;
  styles?: {
    backgroundColor: string;
    width: string;
    minWidth: string;
  }
};
export const Divider: React.FC<DividerProps> = (props) => {
  return (
    <>
      {props.text ? (
        <AntdDivider
          plain={props.plain ?? true}
          dashed={props.dashed ?? false}
          orientation={props.orientation ?? "center"}
          orientationMargin={props.orientationMargin ?? ""}
          type={props.type ?? "horizontal"}
          style={{
            backgroundColor: props.styles?.backgroundColor ?? "#f5f5f5",
            width: props.styles?.width ?? "100%",
            minWidth: props.styles?.minWidth ?? "100%",
          }}
        >
          <span>{props.text}</span>
        </AntdDivider>
      ) : (
        <AntdDivider
          plain={props.plain ?? true}
          dashed={props.dashed ?? false}
          orientation={props.orientation ?? "center"}
          orientationMargin={props.orientationMargin ?? ""}
          type={props.type ?? "horizontal"}
          style={{
            backgroundColor: props.styles?.backgroundColor ?? "#f5f5f5",
            width: props.styles?.width ?? "100%",
            minWidth: props.styles?.minWidth ?? "100%",
          }}
        />
      )}
    </>
  );
};

WidgetRegistry.register("Divider", Divider);
