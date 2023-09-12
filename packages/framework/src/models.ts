export interface Application {
  name: string;
  id: string;
  screens: Screen[];
  theme?: Theme;
}

export interface Screen {
  id: string;
  name: string;
  content: string;
}

export interface EnsembleScreenModel {
  name: string;
  header?: Widget;
  body: Widget;
  onLoad?: InvokeAPIAction;
  apis?: APIModel[];
}

export interface APIModel {
  name: string;
  inputs?: string[];
  uri: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  onResponse?: ExecuteCodeAction;
}

export type ExecuteCodeAction =
  | string
  | {
      body: string;
    };

export interface InvokeAPIAction {
  name: string;
  inputs: Record<string, unknown>;
}

export interface Widget {
  name: string;
  properties: Record<string, unknown>;
}

export interface Theme {
  Colors: {
    seed: string;
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    disabled: string;
    loadingScreenBackgroundColor: string;
    loadingScreenIndicatorColor: string;
  };
}

export type Expression<T> = string | T;
