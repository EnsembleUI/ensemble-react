import React, { useState } from "react";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";
import { Expression, useEnsembleState } from "framework";
import * as MuiIcons from "@mui/icons-material";
import { renderMuiIcon } from "../util/viewUtils";
export type TogglerProps = {
  likedSource?: Expression<string>;
  unlikedSource?: Expression<string>;
  likedLabel?: keyof typeof MuiIcons;
  unlikedLabel?: keyof typeof MuiIcons;
  library?: "MUI";
  hasNotification?: boolean;
  styles?: {
    width?: string;
    height?: string;
    iconWidth: string;
    iconHeight: string;
    padding: string;
    fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    backgroundColor: string;
    notificationStyles?: {
      position: "absolute" | "relative" | "fixed" | "sticky";
      top: number;
      right: number;
      width: string;
      height: string;
      borderRadius: string;
      backgroundColor: string;
    };
  } & HasBorder;
} & EnsembleWidgetProps;

export const Toggler: React.FC<TogglerProps> = (props) => {
  const [isLiked, setIsLiked] = useState(true);
  const [source, setSource] = useState(props.source);
  const { values } = useEnsembleState({ ...props, source }, props.id, {
    setSource,
  });
  const toggleButton = () => {
    setIsLiked(!isLiked);
  };
  const notificationCircleStyles = {
    position: props.styles?.notificationStyles?.position ?? "absolute",
    top: props.styles?.notificationStyles?.top ?? 0,
    right: props.styles?.notificationStyles?.right ?? 0,
    width: props.styles?.notificationStyles?.width ?? "10px",
    height: props.styles?.notificationStyles?.height ?? "10px",
    backgroundColor: props.styles?.notificationStyles?.backgroundColor ?? "red",
    borderRadius: props.styles?.notificationStyles?.borderRadius ?? "50%",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: props.styles?.width ?? 45,
        height: props.styles?.height ?? 45,
        padding: props.styles?.padding ?? 0,
        borderRadius: props.styles?.borderRadius ?? "50%",
        borderWidth: props.styles?.borderWidth ?? "",
        borderColor: props.styles?.borderColor
          ? getColor(props.styles?.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        backgroundColor: props.styles?.backgroundColor ?? "white",
      }}
    >
      {props.likedSource && props.unlikedSource ? (
        isLiked ? (
          <img
            alt=""
            src={values.likedSource}
            style={{
              objectFit: props.styles?.fit ?? "fill",
              width: props.styles?.iconWidth ?? 45,
              height: props.styles?.iconHeight ?? 45,
              borderRadius: props.styles?.borderRadius ?? "50%",
            }}
            onClick={toggleButton}
          />
        ) : (
          <img
            alt=""
            src={values.unlikedSource}
            style={{
              objectFit: props.styles?.fit ?? "fill",
              width: props.styles?.iconWidth ?? 45,
              height: props.styles?.iconHeight ?? 45,
              borderRadius: props.styles?.borderRadius ?? "50%",
            }}
            onClick={toggleButton}
          />
        )
      ) : (
        <span onClick={toggleButton}>
          {props.likedLabel && props.unlikedLabel
            ? isLiked
              ? renderMuiIcon(
                  props.likedLabel,
                  props.styles?.iconWidth,
                  props.styles?.iconHeight,
                )
              : renderMuiIcon(
                  props.unlikedLabel,
                  props.styles?.iconWidth,
                  props.styles?.iconHeight,
                )
            : ""}
        </span>
      )}
      {props?.hasNotification && <div style={notificationCircleStyles}></div>}
    </div>
  );
};

WidgetRegistry.register("Toggler", Toggler);
