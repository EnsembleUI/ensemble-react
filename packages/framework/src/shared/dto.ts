/**
 * DTOs = Data Transfer Objects
 *
 * Mostly equivalent to raw JSON definition over wire
 */

export interface ApplicationDTO {
  name: string;
  id: string;
  screens: ScreenDTO[];
  widgets: WidgetDTO[];
  scripts: ScriptDTO[];
  theme?: ThemeDTO;
  config?: string;
}

export interface ScreenDTO {
  id: string;
  name: string;
  content: string;
}

export interface WidgetDTO {
  id: string;
  name: string;
  content: string;
}

export interface ThemeDTO {
  id: string;
  content: string;
}

export interface ScriptDTO {
  id: string;
  name: string;
  content: string;
}

export interface EnsembleEnvironmentDTO {
  googleOAuthId?: string;
}

export interface EnsembleConfigYAML {
  environmentVariables?: Record<string, unknown>;
}
