import * as Icons from '@mui/icons-material';
import {SvgIconComponent} from "@mui/icons-material";

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

    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  }

  return color.toString();
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

export const getIcon = (name: string): SvgIconComponent | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return (Icons as any)[name];
};
