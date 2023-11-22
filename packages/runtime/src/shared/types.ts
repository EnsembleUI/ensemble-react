import type { EnsembleWidget, Expression } from "@ensembleui/react-framework";

export type EnsembleWidgetStyles = Record<string, string | number>;

export interface EnsembleWidgetProps<T = EnsembleWidgetStyles> {
  id?: string;
  [key: string]: unknown;
  styles?: T;
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
  name: Expression<string>;
  size?: number;
  color?: string;
  styles?: {
    backgroundColor?: string;
    padding?: number | string;
    margin?: number | string;
  } & HasBorder;
} & EnsembleWidgetProps;

// composable types
export interface HasBorder {
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: number | string;
}
