/**
 * DTOs = Data Transfer Objects
 *
 * Mostly equivalent to raw JSON definition over wire
 */
export interface EnsembleDocument {
  readonly id: string;
  readonly name: string;
  readonly content: string;
  readonly path?: string;
  readonly isRoot?: boolean;
  readonly isDraft?: boolean;
  readonly category?: string;
  readonly isArchived?: boolean;
}

export interface ApplicationDTO extends Omit<EnsembleDocument, "content"> {
  readonly screens: ScreenDTO[];
  readonly widgets: WidgetDTO[];
  readonly scripts: ScriptDTO[];
  readonly theme?: ThemeDTO;
  readonly themes?: ThemeDTO[];
  readonly languages?: LanguageDTO[];
  readonly config?: string;

  readonly description?: string;
  readonly isPublic?: boolean;
  readonly isAutoGenerated?: boolean;
  readonly status?: string;
}

export type ScreenDTO = EnsembleDocument;

export type WidgetDTO = EnsembleDocument;

export type ScriptDTO = EnsembleDocument;
export interface ThemeDTO {
  readonly id: string;
  readonly name?: string;
  readonly content: string;
}

export interface LanguageDTO {
  readonly name: string;
  readonly nativeName: string;
  readonly languageCode: string;
  readonly content: string;
}

export interface EnsembleEnvironmentDTO {
  googleOAuthId?: string;
}

export interface EnsembleConfigYAML {
  environmentVariables?: { [key: string]: unknown };
  secretVariables?: { [key: string]: unknown };
}
