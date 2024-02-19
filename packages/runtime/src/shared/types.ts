import type {
  EnsembleAction,
  EnsembleWidget,
  Expression,
  TemplateData,
} from "@ensembleui/react-framework";
import type { HasBorder } from "./hasSchema";

export type EnsembleWidgetStyles = Omit<React.CSSProperties, "direction"> & {
  names?: Expression<string>;
  visible?: boolean;
};

export interface EnsembleWidgetProps<
  T extends Partial<EnsembleWidgetStyles> = EnsembleWidgetStyles,
> {
  id?: string;
  styles?: T;
  htmlAttributes?: { [key: string]: Expression<string> };
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

export interface FlexboxStyles {
  mainAxis?: string;
  crossAxis?: string;
  gap?: number;
  margin?: number | string;
  padding?: number | string;
  maxWidth?: string;
  minWidth?: string;
  visible?: boolean;
}

export type FlexboxProps = {
  "item-template"?: {
    data: Expression<TemplateData>;
    name: string;
    template: EnsembleWidget;
  };
  onTap?: EnsembleAction;
  children?: EnsembleWidget[];
} & FlexboxStyles &
  HasBorder &
  EnsembleWidgetProps<FlexboxStyles & EnsembleWidgetStyles>;

export type IconProps = {
  name: Expression<string>;
  size?: number;
  color?: string;
  styles?: {
    backgroundColor?: string;
    padding?: number | string;
    margin?: number | string;
  } & HasBorder;
  onTap?: EnsembleAction;
  onMouseEnter?: EnsembleAction;
  onMouseLeave?: EnsembleAction;
} & EnsembleWidgetProps;
