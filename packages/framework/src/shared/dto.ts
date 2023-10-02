/**
 * DTOs = Data Transfer Objects
 *
 * Mostly equivalent to raw JSON definition over wire
 */
export interface ApplicationDTO {
  name: string;
  id: string;
  screens: ScreenDTO[];
  theme?: ThemeDTO;
}

export interface ScreenDTO {
  id: string;
  name: string;
  content: string;
}

export interface ThemeDTO {
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
