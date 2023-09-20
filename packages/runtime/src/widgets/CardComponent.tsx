import { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Card } from "antd";
import { Widget } from "framework";
import { random } from "lodash-es";

export type CardComponentProps = {
  image?: {
    source: string;
    width: string;
    height: string;
  };
  children: Widget[];
  styles?: {
    display: string; //write only display options
    flexDirection?:
      | "row"
      | "row-reverse"
      | "column"
      | "column-reverse"
      | undefined;
    justifyContent: string; //justify options
    alignItems: string;
    border: string;
    borderRadius: string;
    borderWidth: string;
    boxShadow: string;
    width: number;
    height: number;
    margin: string;
    padding: string;
  };
};

export const CardComponent: React.FC<CardComponentProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  const coverImage = props.image ? (
    <img alt="example" src={props.image.source} />
  ) : null;
  return (
    <Card
      style={{
        display: props.styles?.display ?? "flex",
        flexDirection: props.styles?.flexDirection ?? "column",
        justifyContent: props.styles?.justifyContent ?? "center",
        alignItems: props.styles?.alignItems ?? "center",
        border: props.styles?.border ?? "0px",
        borderRadius: props.styles?.borderRadius ?? "10px",
        borderWidth: props.styles?.borderWidth,
        boxShadow: props.styles?.boxShadow ?? "inherit",
        width: props.styles?.width ?? 250,
        height: props.styles?.height ?? 140,
        padding: props.styles?.padding ?? "0px",
        margin: props.styles?.margin ?? "10px 10px 0px 0px",
      }}
      cover={coverImage}
    >
      {renderedChildren}
    </Card>
  );
};

WidgetRegistry.register("CardComponent", CardComponent);
