import React, { useState, useEffect } from "react";
import { Progress as AntProgress } from "antd";
import {
  type Expression,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";

export interface ProgressStyle {
  size?: number;
  thickness?: number;
  color?: Expression<string>;
  borderRadius?: Expression<string>;
  backgroundColor?: Expression<string>;
  margin?: string;
}

export type ProgressProps = {
  display?: "linear" | "circular";
  countdown?: number;
  filledPercentage?: number;
} & EnsembleWidgetProps<ProgressStyle>;

const Progress: React.FC<ProgressProps> = (props) => {
  const { display, countdown, styles } = props;

  // Determine whether to use linear or circular progress based on the "display" prop
  const isCircular = display === "circular";
  const isLinear = display === "linear";
  const DEFAULT_STROKE_WIDTH = 6;
  const DEFAULT_RADIUS = 9.5;
  const radius = styles?.size || DEFAULT_RADIUS;
  const thickness = styles?.thickness ? styles.thickness : DEFAULT_STROKE_WIDTH;
  // Calculate the percentage based on the countdown value
  const [percent, setPercent] = useState(countdown ? 0 : -1);
  const { id, values } = useRegisterBindings({ ...props }, props.id);

  useEffect(() => {
    // If countdown is present and greater than 0, calculate the target percent for animation
    if (countdown && countdown > 0) {
      const targetPercent = 100;
      let currentPercent = 0;
      const interval = setInterval(
        () => {
          if (currentPercent < targetPercent) {
            currentPercent += 1;
            setPercent(currentPercent);
          } else {
            clearInterval(interval);
          }
        },
        (countdown * 1000) / targetPercent,
      );
      return () => clearInterval(interval);
    }
    setPercent(-1);
  }, [countdown]);

  if (isCircular && countdown) {
    // When display is circular
    return (
      <div style={{ margin: values?.styles?.margin }}>
        <AntProgress
          percent={percent}
          showInfo={false}
          size={values?.styles?.size || "default"}
          strokeColor={values?.styles?.color || ""}
          strokeWidth={thickness}
          type="circle"
        />
      </div>
    );
  }

  if (isCircular) {
    return (
      <div style={{ margin: values?.styles?.margin }}>
        <svg
          height={radius * 2}
          width={radius * 2}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <circle
              cx={radius}
              cy={radius}
              fill="none"
              r={radius - thickness / 2}
              stroke={`${
                values?.styles?.color ? values?.styles.color : "#000"
              }`}
              strokeLinecap="round"
              strokeWidth={thickness}
            >
              <animate
                attributeName="stroke-dasharray"
                calcMode="spline"
                dur="2s"
                keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                keyTimes="0;0.475;0.95;1"
                repeatCount="indefinite"
                values={`0 ${2 * Math.PI * (radius - thickness / 2)};
                           ${0.66 * Math.PI * radius} ${
                             2 * Math.PI * (radius - thickness / 2)
                           };
                           ${0.66 * Math.PI * radius} ${
                             2 * Math.PI * (radius - thickness / 2)
                           };
                           ${0.66 * Math.PI * radius} ${
                             2 * Math.PI * (radius - thickness / 2)
                           }`}
              />
              <animate
                attributeName="stroke-dashoffset"
                calcMode="spline"
                dur="2s"
                keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                keyTimes="0;0.475;0.95;1"
                repeatCount="indefinite"
                values={`0;
                           ${-0.53 * Math.PI * radius};
                           ${-1.96 * Math.PI * radius};
                           ${-1.96 * Math.PI * radius}`}
              />
            </circle>
            <animateTransform
              attributeName="transform"
              dur="2s"
              repeatCount="indefinite"
              type="rotate"
              values={`0 ${radius} ${radius};360 ${radius} ${radius}`}
            />
          </g>
        </svg>
      </div>
    );
  }

  if (isLinear && countdown) {
    return (
      <div
        style={{
          width: values?.styles?.size ? `${values?.styles.size}px` : "auto", // Set width only for circular display
        }}
      >
        <AntProgress
          percent={percent}
          showInfo={false}
          size="default"
          strokeColor={values?.styles?.color || ""}
          strokeWidth={thickness}
        />
      </div>
    );
  }
  if (isLinear && values?.filledPercentage !== undefined) {
    return (
      <div style={{ margin: values?.styles?.margin }}>
        <div className={`${id} loader-static`} />
        <style>
          {`
			/* Linear loader */
			.${id}.loader-static {
			  display: block;
			  position: relative;
			  background-color: ${
          values?.styles?.backgroundColor
            ? values.styles.backgroundColor
            : "rgba(0,0,0,0.1)"
        };
			  height: ${styles?.thickness ? styles.thickness : 12}px;
			  width: ${values?.styles?.size ? `${values?.styles.size}px` : "100%"};
			  border-radius: ${values?.styles?.borderRadius ?? ""};
			  overflow: hidden;
			}
			.${id}.loader-static::after {
			  content: '';
			  width: ${values?.filledPercentage}%;
			  height: 100%;
			  background: ${values?.styles?.color ? values?.styles.color : "#1890ff"};
			  position: absolute;
			  top: 0;
			  left: 0;
			  box-sizing: border-box;
			}
		  `}
        </style>
      </div>
    );
  }
  return (
    <div style={{ margin: values?.styles?.margin }}>
      <div className={`${id} loader`} />
      <style>
        {`
			/* Linear loader animation */
			.${id}.loader {
			  display: block;
			  position: relative;
			  background-color: ${
          values?.styles?.backgroundColor
            ? values.styles.backgroundColor
            : "rgba(0,0,0,0.1)"
        };
			  height: ${styles?.thickness ? styles.thickness : 12}px;
			  width: ${values?.styles?.size ? `${values?.styles.size}px` : "100%"};
			  border-radius: ${values?.styles?.borderRadius ?? ""};
			  overflow: hidden;
			}
			.${id}.loader::after {
			  content: '';
			  width: 40%;
			  height: 100%;
			  background: ${values?.styles?.color ? values?.styles.color : "#1890ff"};
			  position: absolute;
			  top: 0;
			  left: 0;
			  box-sizing: border-box;
			  animation: animloader 1.5s linear infinite;
			}
			
			@keyframes animloader {
			  0% {
				left: 0;
				transform: translateX(-100%);
			  }
			  100% {
				left: 100%;
				transform: translateX(0%);
			  }
			}
		  `}
      </style>
    </div>
  );
};

WidgetRegistry.register("Progress", Progress);
