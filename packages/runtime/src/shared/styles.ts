import { get, isInteger } from "lodash-es";
import type React from "react";
import { IconRegistry } from "../registry";
import type { TextAlignment } from "./styleSchema";

type Color = number | string;

const namedColors: { [key in Color]?: string } = {
  black: "0xff000000",
  white: "0xffffffff",
  red: "0xffff0000",
  blue: "0xff0000ff",
  grey: "0xff808080",
  teal: "0xff008080",
  amber: "0xFFFFBF00",
  pink: "0xFFFFC0CB",
  purple: "0xFF800080",
  yellow: "0xFFFFFF00",
  green: "0xFF008000",
  brown: "0xFFA52A2A",
  cyan: "0xFF00FFFF",
  indigo: "0xFF4B0082",
  lime: "0xFF00FF00",
  orange: "0xFFFFA500",
};

export const getColor = (color: number | string): string => {
  const myColor = namedColors[color] || color;
  if (myColor === "transparent") {
    return myColor;
  }

  if (typeof myColor === "string" && myColor.startsWith("0x")) {
    const alpha = parseInt(myColor.slice(2, 4), 16) / 255;
    const r = parseInt(myColor.slice(4, 6), 16);
    const g = parseInt(myColor.slice(6, 8), 16);
    const b = parseInt(myColor.slice(8, 10), 16);

    const rgba = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    return rgba;
  }

  return color.toString();
};

/// same common properties as with Flutter
export const getTextAlign = (value: string | undefined): TextAlignment => {
  switch (value) {
    case "left":
      return "left";
    case "right":
      return "right";
    case "center":
      return "center";
    case "justify":
      return "justify";
    case "end":
      return "end";
    case "start":
    default:
      return "start";
  }
};

export const getMainAxis = (mainAxis: string): string | undefined => {
  switch (mainAxis) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "center":
      return "center";
    case "spaceBetween":
      return "space-between";
    case "spaceAround":
      return "space-around";
    default:
      return undefined;
  }
};

export const getCrossAxis = (crossAxis: string): string | undefined => {
  switch (crossAxis) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "center":
      return "center";
    case "stretch":
      return "stretch";
    case "baseline":
      return "baseline";
    default:
      return undefined;
  }
};

export const getIcon = <T = React.ComponentType<any>>(
  name: string,
): T | undefined => {
  return IconRegistry.find(name) as T | undefined;
};

export const getComponentStyles = (
  name: string,
  styles?: React.CSSProperties,
  returnAsString = true,
): string | React.CSSProperties => {
  const styleNames = Object.keys(styles || {}).filter((key) =>
    key.startsWith(name),
  );
  let result = "";
  let res: React.CSSProperties = {};

  styleNames.forEach((property) => {
    const styleValue = get(styles, property) as string | undefined;
    if (styleValue) {
      const cssProperty = property
        .replace(name, "")
        // eslint-disable-next-line prefer-named-capture-group
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase(); // convert camelCase to kebab-case
      result += `${cssProperty}: ${styleValue};`;
      res = { ...res, [cssProperty]: styleValue };
    }
  });

  return returnAsString ? result : res;
};

export const evaluateStyleValue = (
  value: string | number | undefined,
  defaultUnit = "px",
): string | number => {
  if (value) {
    return isInteger(value) ? `${value}${defaultUnit}` : value;
  }
  return `0${defaultUnit}`;
};
