import type { EnsembleAction } from "./actions";
import type { ThemeDTO } from "./dto";

/**
 * Models
 *
 * Higher order objects than DTOs that have been marshalled/decorated
 * with additional properties
 */
export interface EnsembleScreenModel {
  name: string;
  header?: EnsembleWidget;
  body: EnsembleWidget;
  onLoad?: EnsembleAction;
  apis?: EnsembleAPIModel[];
}

export type EnsembleEntryPoint = EnsembleScreenModel | EnsembleMenuModel;

export interface EnsembleAppModel {
  menu?: EnsembleMenuModel;
  screens: EnsembleScreenModel[];
  home: EnsembleEntryPoint;
  theme?: ThemeDTO;
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
