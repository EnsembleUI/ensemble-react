import type { CSSProperties } from "react";
import type { EnsembleAction } from "./actions";
import type { EnsembleConfigYAML } from "./dto";

/**
 * Models
 *
 * Higher order objects than DTOs that have been marshalled/decorated
 * with additional properties
 */
export interface EnsembleScreenModel {
  id: string;
  name: string;
  body: EnsembleWidget;
  path?: string;
  onLoad?: EnsembleAction;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  apis?: EnsembleAPIModel[];
  global?: string;
  styles?: { [key: string]: unknown };
  importedScripts?: string;
}

export type EnsembleEntryPoint = EnsembleScreenModel | EnsembleMenuModel;

export interface EnsembleAppModel {
  id: string;
  menu?: EnsembleMenuModel;
  screens: EnsembleScreenModel[];
  customWidgets: CustomWidgetModel[];
  home: EnsembleEntryPoint;
  theme?: EnsembleThemeModel;
  themes?: { [key: string]: EnsembleThemeModel | undefined };
  scripts: EnsembleScriptModel[];
  config?: EnsembleConfigYAML;
}

export interface EnsembleMenuModel {
  id?: string;
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
  styles: { [key: string]: unknown };
}

export interface EnsembleAPIModel {
  name: string;
  inputs?: string[];
  uri: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  headers?: { [key: string]: string | number | boolean };
  body?: string | object;
  onResponse?: EnsembleAction;
  onError?: EnsembleAction;
}

export interface EnsembleWidget {
  name: string;
  properties: { [key: string]: unknown };
  key?: string;
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
  apis?: EnsembleAPIModel[];
}

export interface EnsembleThemeModel {
  Tokens?: {
    Colors?: {
      primary?: string;
    } & { [key: string]: string };
    Spacing?: { [key: string]: string };
    Animation?: { [key: string]: string };
    Typography?: {
      fontFamily?: string;
    } & { [key: string]: string };
  };
  Styles?: { [key: string]: CSSProperties };
}

export interface EnsembleScriptModel {
  name: string;
  body: string;
}
