export interface Application {
  name: string;
  id: string;
  screens: Screen[];
}

export interface Screen {
  id: string;
  name: string;
  content: string;
}

export interface EnsembleScreen {
  name: string;
  root: Widget;
}

export interface Widget {
  name: string;
  properties: Record<string, unknown>;
  children: Widget[];
}
