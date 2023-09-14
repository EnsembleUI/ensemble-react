import type { Widget } from "framework";

export interface EnsembleWidgetProps {
  id?: string;
  [key: string]: unknown;
}

export type FlexboxProps = {
  children: Widget[];
  mainAxis?: string;
  crossAxis?: string;
  gap?: number;
} & EnsembleWidgetProps;

export type IconProps = {
  name: string;
  size?: number;
  color?: string;
} & EnsembleWidgetProps;
