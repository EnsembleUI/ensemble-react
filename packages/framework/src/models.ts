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

export interface EnsembleScreen {
  name: string;
  header?: Widget;
  body: Widget;
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
