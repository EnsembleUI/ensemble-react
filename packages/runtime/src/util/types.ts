import type { EnsembleWidget, Expression } from "framework";

export interface EnsembleWidgetProps {
  id?: string;
  [key: string]: unknown;
  styles?: Record<string, string | number>;
}

export type BaseTextProps = {
  [key: string]: unknown;
  text?: Expression<string>;
  textAlign?: string;
} & EnsembleWidgetProps;

export type FlexboxProps = {
  children: EnsembleWidget[];
  mainAxis?: string;
  crossAxis?: string;
  gap?: number;
  margin?: number | string;
  padding?: number | string;
} & HasBorder &
  EnsembleWidgetProps;

export type IconProps = {
  name: string;
  size?: number;
  color?: string;
} & EnsembleWidgetProps;

export interface GridViewStyles {
  horizontalTileCount?: number;
  horizontalGap?: number;
  verticalGap?: number;
}

// composable types
export interface HasBorder {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
}
