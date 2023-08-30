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
  header?: Widget;
  body: Widget;
}

export interface Widget {
  name: string;
  properties: Record<string, unknown>;
}
