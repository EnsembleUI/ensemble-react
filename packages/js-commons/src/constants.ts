export const HiddenManifestFile = ".manifest.json";
export const AppManifestDataFile = "apps-manifest.json";

export const ArtifactYamlFolderNames = {
  theme: "Theme",
  screens: "Screens",
  widgets: "Widgets",
  scripts: "Scripts",
  translations: "Translations",
} as const;

export const ArtifactFilesName = {
  theme: "theme.json",
  assets: "asset.json",
  screens: "screen.json",
  widgets: "widget.json",
  scripts: "script.json",
  translations: "i18n.json",
  env: "environment.json",
  groupLabels: "label.json",
} as const;
