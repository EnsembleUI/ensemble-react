import type {
  EnsembleWidget,
  Expression,
  TemplateData,
} from "@ensembleui/react-framework";

export type EnsembleWidgetStyles = Omit<React.CSSProperties, "direction"> & {
  names?: Expression<string>;
};

export interface EnsembleWidgetProps<
  T extends Partial<EnsembleWidgetStyles> = EnsembleWidgetStyles,
> {
  id?: string;
  styles?: T;
  [key: string]: unknown;
}

export interface HasItemTemplate {
  "item-template"?: {
    data: Expression<TemplateData>;
    name: string;
    template: EnsembleWidget;
  };
}

export type BaseTextProps = {
  text?: Expression<string>;
  textAlign?: string;
} & EnsembleWidgetProps;

export type FlexboxProps = {
  "item-template"?: {
    data: Expression<TemplateData>;
    name: string;
    template: EnsembleWidget;
  };
  children?: EnsembleWidget[];
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
