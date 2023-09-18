import { useMemo } from "react";
import { Row as AntRow } from "antd";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getColor, getCrossAxis, getMainAxis } from "../util/utils";
import type { FlexboxProps } from "../util/types";
import { get } from "lodash-es";
import { Avatar, Card } from "antd";
import { Widget } from "framework";
const { Meta } = Card;

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
        flexDirection: (props.styles?.flexDirection) ?? "column",
        justifyContent: props.styles?.justifyContent ?? "center",
        alignItems: props.styles?.alignItems ?? "center",
        border: props.styles?.border ?? "0px",
        borderRadius: props.styles?.borderRadius ?? "10px",
        borderWidth: props.styles?.borderWidth,
        boxShadow: props.styles?.boxShadow ?? "inherit",
        width: props.styles?.width ?? 250,
        height: props.styles?.height ?? 140,
        padding: props.styles?.padding ?? "10px",
        margin: props.styles?.margin ?? "10px",
       }}
      cover={coverImage}
    >
      
      {renderedChildren}
    </Card>
  );
};

WidgetRegistry.register("CardComponent", CardComponent);
