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
  name?: string;
  inputs?: string[];
  body: EnsembleWidget;
  path?: string;
  onLoad?: EnsembleAction;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  menu?: EnsembleMenuModel;
  apis?: EnsembleAPIModel[];
  global?: string;
  styles?: { [key: string]: unknown };
  importedScripts?: string;
  customWidgets?: CustomWidgetModel[];
  sockets?: EnsembleSocketModel[];
  events?: EnsembleCustomEventModel[];
  readonly isRoot?: boolean;
}

export type EnsembleEntryPoint = EnsembleScreenModel | EnsembleMenuModel;

export interface EnsembleAppModel {
  id: string;
  menu?: EnsembleMenuModel;
  screens: EnsembleScreenModel[];
  customWidgets: CustomWidgetModel[];
  home: EnsembleEntryPoint;
  themes: { [key: string]: EnsembleThemeModel };
  scripts: EnsembleScriptModel[];
  config?: EnsembleConfigYAML;
  languages?: EnsembleLanguageModel[];
  fonts?: EnsembleFontModel[];
}

export interface EnsembleMenuModel {
  id?: string;
  type: EnsembleMenuModelType;
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
  importedScripts?: string;
}

export enum EnsembleMenuModelType {
  SideBar = "SideBar",
  Drawer = "Drawer",
}

export interface EnsembleAPIModel {
  name: string;
  inputs?: string[];
  uri?: string;
  url?: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  headers?: { [key: string]: string | number | boolean };
  cacheExpirySeconds?: number;
  body?: string | object;
  onResponse?: EnsembleAction;
  onError?: EnsembleAction;
  mockResponse?: EnsembleMockResponse | string;
}

export interface EnsembleMockResponse {
  statusCode: number;
  body: object | string;
  headers?: { [key: string]: string };
  reasonPhrase?: string;
}

export interface EnsembleCustomEventModel {
  name: string;
  data?: { [key: string]: unknown };
}

export interface EnsembleSocketModel {
  name: string;
  uri: string;
  onSuccess?: EnsembleAction;
  onReceive?: EnsembleAction;
  onDisconnect?: EnsembleAction;
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
  events?: EnsembleCustomEventModel[];
}

export interface EnsembleThemeModel {
  name: string;
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

export interface EnsembleLanguageModel {
  name: string;
  nativeName: string;
  languageCode: string;
  resources: { [key: string]: unknown };
}

export interface EnsembleFontModel {
  family: string;
  url: string;
  options: {
    weight: string;
    style: string;
  };
}
