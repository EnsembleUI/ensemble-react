import Lottie from "react-lottie";
import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";

export type LottieProps = {
  source: Expression<string>;
  styles?: {
    width?: number;
    height?: number;
    repeat?: boolean;
    fit?:
      | "fill"
      | "contain"
      | "cover"
      | "fitWidth"
      | "fitHeight"
      | "none"
      | "scaleDown";
  };
} & EnsembleWidgetProps;

export const LottieWidget: React.FC<LottieProps> = (props) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  useEffect(() => {
    // Fetch the Lottie animation data from the URL
    fetch(props.source)
      .then((response) => response.json())
      .then((data: object) => {
        // Set the animation data once it's fetched
        setAnimationData(data);
      })
      .catch((error) => {
        console.error("Error fetching animation data:", error);
      });
  }, [props.source]);
  const defaultOptions = {
    loop: props.styles?.repeat ? props.styles.repeat : true,
    autoplay: true,
    animationData,
  };
  return (
    <div
      style={{
        width: props.styles?.width,
        height: props.styles?.height,
        margin: `${props.styles?.margin ? `${props.styles.margin}px` : "auto"}`,
        padding: `${
          props.styles?.padding ? `${props.styles.padding}px` : "auto"
        }`,
      }}
    >
      {animationData ? <Lottie options={defaultOptions} /> : null}
    </div>
  );
};

WidgetRegistry.register("Lottie", LottieWidget);
