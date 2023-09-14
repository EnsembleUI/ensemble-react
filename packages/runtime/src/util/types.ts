import type { Widget } from "framework";
import {Expression} from "framework";

export interface EnsembleWidgetProps {
  id?: string;
  [key: string]: unknown;
}

export type BaseTextProps = {
  [key: string]: unknown;
  text?: Expression<string>;
  textAlign?: string;
} & EnsembleWidgetProps;

export type FlexboxProps = {
  children: Widget[];
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

// composable types
export type HasBorder = {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
};
