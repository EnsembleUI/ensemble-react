import React, { useState, useEffect } from "react";
import { Progress as AntProgress } from "antd";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";

export type ProgressProps = {
  display?: "linear" | "circular";
  countdown?: number;
  styles?: {
    size?: number;
    thickness?: number;
    color?: string;
  };
} & EnsembleWidgetProps;

const Progress: React.FC<ProgressProps> = (props) => {
  const { display, countdown, styles } = props;

  // Determine whether to use linear or circular progress based on the "display" prop
  const isCircular = display === "circular";
  const strokeWidth = isCircular && styles?.thickness ? styles.thickness : 6; // Use styles.thickness if available for circular display, otherwise default to 6

  // Calculate the percentage based on the countdown value
  const [percent, setPercent] = useState(countdown ? 0 : -1);

  useEffect(
    function settingUpInitialAnimation() {
      // If countdown is present and greater than 0, calculate the target percent
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
          (countdown * 1000) / targetPercent
        );
        return () => clearInterval(interval);
      } else {
        setPercent(-1);
      }
    },
    [countdown]
  );

  return (
    <div
      style={{
        width: !isCircular && styles?.size ? `${styles.size}px` : "auto", // Set width only for circular display
      }}
    >
      {percent !== -1 ? (
        <AntProgress
          percent={percent}
          showInfo={false}
          size={isCircular && styles?.size ? styles.size : "default"}
          strokeColor={styles?.color ? styles.color : ""}
          strokeWidth={strokeWidth}
          type={isCircular ? "circle" : "line"}
        />
      ) : (
        <div className={`${isCircular ? "spinner circular" : "loader"}`} />
      )}
      <style>
        {isCircular
          ? `
			/* Spinner animation */
			.spinner {
			  width: ${styles?.size ? styles.size : 10}px;
			  height: ${styles?.size ? styles.size : 10}px;
			  border-radius: 50%;
			  border: ${
          styles?.thickness ? styles.thickness : 4
        }px solid rgba(0, 0, 0, 0.1);
			  border-top: ${styles?.thickness ? styles.thickness : 4}px solid ${
          styles?.color ? styles.color : "#1890ff"
        }; /* Change this to your desired spinner color */
			  animation: spin 1s linear infinite;
			  margin: auto;
			}
			
			/* Circular spinner */
			.spinner.circular {
				width: ${styles?.size ? styles.size : 10}px;
				height: ${styles?.size ? styles.size : 10}px;
			}
			
			/* Keyframes for the spinner animation */
			@keyframes spin {
			  0% { transform: rotate(0deg); }
			  100% { transform: rotate(360deg); }
			}
			
		`
          : `
          /* Linear loader animation */
          .loader {
            display: block;
            position: relative;
			background-color: rgba(0,0,0,0.1);
            height: ${styles?.thickness ? styles.thickness : 12}px;
            width: 100%;
            overflow: hidden;
          }
          .loader::after {
            content: '';
            width: 40%;
            height: 100%;
            background: ${styles?.color ? styles.color : "#1890ff"};
            position: absolute;
            top: 0;
            left: 0;
            box-sizing: border-box;
            animation: animloader 2s linear infinite;
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
