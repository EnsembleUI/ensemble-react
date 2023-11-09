import type { EnsembleWidget, Expression } from "@ensembleui/react-framework";

export interface EnsembleWidgetProps<T = Record<string, string | number>> {
  id?: string;
  styles?: T;
  [key: string]: unknown;
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
  maxWidth?: string;
  minWidth?: string;
} & HasBorder &
  EnsembleWidgetProps;

export type IconProps = {
  name: string;
  size?: number;
  color?: string;
  styles?: {
    backgroundColor?: string;
    padding?: number | string;
    margin?: number | string;
  } & HasBorder;
} & EnsembleWidgetProps;

export interface GridViewStyles {
  horizontalTileCount?: number;
  horizontalGap?: number;
  verticalGap?: number;
}

export type SearchStyles = {
  width?: number;
  height?: number;
  margin?: number | string;
  backgroundColor?: string;
} & HasBorder;

// composable types
export interface HasBorder {
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: number | string;
}
