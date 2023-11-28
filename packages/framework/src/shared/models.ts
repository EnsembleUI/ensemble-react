import type { CSSProperties } from "react";
import type { EnsembleAction } from "./actions";

/**
 * Models
 *
 * Higher order objects than DTOs that have been marshalled/decorated
 * with additional properties
 */
export interface EnsembleScreenModel {
  name: string;
  body: EnsembleWidget;
  onLoad?: EnsembleAction;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  apis?: EnsembleAPIModel[];
  global?: string;
}

export type EnsembleEntryPoint = EnsembleScreenModel | EnsembleMenuModel;

export interface EnsembleAppModel {
  id: string;
  menu?: EnsembleMenuModel;
  screens: EnsembleScreenModel[];
  customWidgets: CustomWidgetModel[];
  home: EnsembleEntryPoint;
  theme?: EnsembleThemeModel;
}

export interface EnsembleMenuModel {
  type: string;
  items: {
    label: string;
    icon?: string;
    page: string;
    screen?: EnsembleScreenModel;
    selected: boolean;
  }[];
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  styles: Record<string, unknown>;
}

export interface EnsembleAPIModel {
  name: string;
  inputs?: string[];
  uri: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  headers?: Record<string, string | number | boolean>;
  body?: Record<string, unknown>;
  onResponse?: EnsembleAction;
  onError?: EnsembleAction;
}

export interface EnsembleWidget {
  name: string;
  properties: Record<string, unknown>;
}

export interface EnsembleHeaderModel {
  title: string | EnsembleWidget;
  styles?: {
    backgroundColor?: string;
    centerTitle?: boolean;
    titleBarHeight?: string | number;
    color?: string;
    [key: string]: unknown;
  };
}

export interface EnsembleFooterModel {
  children: EnsembleWidget[];
  styles?: {
    backgroundColor?: string;
    height?: string | number;
    width?: string | number;
    [key: string]: unknown;
  };
}

export interface CustomWidgetModel {
  name: string;
  inputs: string[];
  onLoad?: EnsembleAction;
  body: EnsembleWidget;
}

export interface EnsembleThemeModel {
  Tokens?: {
    Colors?: {
      primary?: string;
    } & Record<string, string>;
    Spacing?: Record<string, string>;
    Animation?: Record<string, string>;
    Typography?: {
      fontFamily?: string;
    } & Record<string, string>;
  };
  Styles?: Record<string, CSSProperties>;
}
