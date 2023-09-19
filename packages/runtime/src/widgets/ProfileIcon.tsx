import React, { useState } from "react";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";
import { Expression, useEnsembleState } from "framework";
import { TextAlign } from "chart.js";

export type ProfileIconProps = {
  source?: Expression<string>;
  name?: Expression<string>;
  styles?: {
    width?: number | string;
    height?: number | string;
    fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    backgroundColor: string;
    nameStyles?:{
        color: string;
        fontSize: string;
        fontFamily: string;
        fontWeight: string;
        textAlign: string;
    }
    
  } & HasBorder;
} & EnsembleWidgetProps;

export const ProfileIcon: React.FC<ProfileIconProps> = (props) => {
  const [source, setSource] = useState(props.source);
  const { values } = useEnsembleState({ ...props, source }, props.id, {
    setSource,
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: props.styles?.width ?? 45,
        height: props.styles?.height ?? 45,
        borderRadius: props.styles?.borderRadius ?? "50%",
        borderWidth: props.styles?.borderWidth ?? "",
        borderColor: props.styles?.borderColor
          ? getColor(props.styles?.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        backgroundColor: props.styles?.backgroundColor ?? "blue",
      }}
    >
      {props.source ? (
        <img
          alt=""
          src={values.source}
          style={{
            objectFit: props.styles?.fit ?? "fill",
            width: props.styles?.width ?? 45,
            height: props.styles?.height ?? 45,
            borderRadius: props.styles?.borderRadius ?? "50%",
          }}
        />
      ) : (
        <span
          style={{
            color: props.styles?.nameStyles?.color ?? "white",
            fontSize: props.styles?.nameStyles?.fontSize ?? "1.2rem",
            fontFamily: props.styles?.nameStyles?.fontFamily ?? "sans-serif",
            fontWeight: props.styles?.nameStyles?.fontWeight ?? "bold",
            textAlign:
              (props.styles?.nameStyles?.textAlign as TextAlign) ?? "center",
          }}
        >
          {props?.name?.charAt(0)}
        </span>
      )}
    </div>
  );
};

WidgetRegistry.register("ProfileIcon", ProfileIcon);
