import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type {
  YamlApplicationTransporter,
  LocalApplicationTransporter,
} from "./transporter";
import {
  ArtifactFilesName,
  HiddenManifestFile,
  AppManifestDataFile,
  ArtifactYamlFolderNames,
} from "./constants";
import type {
  ThemeDTO,
  AssetDTO,
  ScreenDTO,
  WidgetDTO,
  ScriptDTO,
  LanguageDTO,
  ApplicationDTO,
  EnvironmentDTO,
  ApplicationMetaDTO,
  EnsembleDocument,
} from "./dto";
import { EnsembleDocumentType } from "./enums";

export const getLocalApplicationTransporter = (
  hiddenEnsembleFolder: string,
): LocalApplicationTransporter => ({
  get: async (appId: string): Promise<ApplicationDTO | null> => {
    const userAppFolder = join(hiddenEnsembleFolder, appId);
    if (!existsSync(userAppFolder)) return null;

    const [
      env,
      theme,
      assets,
      screens,
      widgets,
      scripts,
      groupLabels,
      translations,
    ] = await Promise.all([
      readJsonFile<EnvironmentDTO>(join(userAppFolder, ArtifactFilesName.env)),
      readJsonFile<ThemeDTO>(join(userAppFolder, ArtifactFilesName.theme)),
      readJsonFile<AssetDTO[]>(join(userAppFolder, ArtifactFilesName.assets)),
      readJsonFile<ScreenDTO[]>(join(userAppFolder, ArtifactFilesName.screens)),
      readJsonFile<WidgetDTO[]>(join(userAppFolder, ArtifactFilesName.widgets)),
      readJsonFile<ScriptDTO[]>(join(userAppFolder, ArtifactFilesName.scripts)),
      readJsonFile<Record<string, string>>(
        join(userAppFolder, ArtifactFilesName.groupLabels),
      ),
      readJsonFile<LanguageDTO[]>(
        join(userAppFolder, ArtifactFilesName.translations),
      ),
    ]);

    const applicationData: ApplicationDTO = {
      env,
      theme,
      assets,
      widgets,
      scripts,
      name: "",
      id: appId,
      translations,
      screens: screens ?? [],
      groupLabels: convertJsonToMap(groupLabels ?? {}),
    };
    return applicationData;
  },
  put: async (appData: ApplicationDTO): Promise<void> => {
    const userAppFolder = join(hiddenEnsembleFolder, appData.id);
    ensureDir(userAppFolder);

    const jsonFilesPath = {
      env: join(userAppFolder, ArtifactFilesName.env),
      theme: join(userAppFolder, ArtifactFilesName.theme),
      assets: join(userAppFolder, ArtifactFilesName.assets),
      screens: join(userAppFolder, ArtifactFilesName.screens),
      widgets: join(userAppFolder, ArtifactFilesName.widgets),
      scripts: join(userAppFolder, ArtifactFilesName.scripts),
      groupLabels: join(userAppFolder, ArtifactFilesName.groupLabels),
      translations: join(userAppFolder, ArtifactFilesName.translations),
    };

    await Promise.all([
      writeJsonData(jsonFilesPath.env, appData.env ?? {}),
      writeJsonData(jsonFilesPath.theme, appData.theme ?? {}),
      writeJsonData(jsonFilesPath.assets, appData.assets ?? []),
      writeJsonData(jsonFilesPath.screens, appData.screens ?? []),
      writeJsonData(jsonFilesPath.scripts, appData.scripts ?? []),
      writeJsonData(jsonFilesPath.widgets, appData.widgets ?? []),
      writeJsonData(jsonFilesPath.groupLabels, appData.groupLabels ?? []),
      writeJsonData(jsonFilesPath.translations, appData.translations ?? []),
    ]);
  },
});

export const getYamlApplicationTransporter = (
  yamlFolder: string,
  globalFolder: string,
): YamlApplicationTransporter => ({
  get: async (
    appId: string,
    documentId: string,
    documentType: string,
  ): Promise<string> => {
    const appsMetaData = await getAppMetaData(globalFolder);
    const appMetaData = appsMetaData.find((data) => data.id === appId);
    if (!appMetaData) return "";

    const userAppFolder = join(yamlFolder, appMetaData.name);
    if (!existsSync(userAppFolder)) return "";

    let path = "";
    switch (documentType) {
      case EnsembleDocumentType.Screen:
        path = join(userAppFolder, ArtifactYamlFolderNames.screens);
        break;
      case EnsembleDocumentType.Widget:
        path = join(userAppFolder, ArtifactYamlFolderNames.widgets);
        break;
      case EnsembleDocumentType.Script:
        path = join(userAppFolder, ArtifactYamlFolderNames.scripts);
        break;
      case EnsembleDocumentType.I18n:
        path = join(userAppFolder, ArtifactYamlFolderNames.translations);
        break;
      case EnsembleDocumentType.Theme:
        path = join(userAppFolder, ArtifactYamlFolderNames.theme);
    }

    return readYamlContent(path, documentId);
  },
  put: async (app: ApplicationDTO): Promise<void> => {
    const userAppFolder = join(yamlFolder, app.name);
    ensureDir(userAppFolder);

    const yamlFolders = {
      theme: join(userAppFolder, ArtifactYamlFolderNames.theme),
      screens: join(userAppFolder, ArtifactYamlFolderNames.screens),
      widgets: join(userAppFolder, ArtifactYamlFolderNames.widgets),
      scripts: join(userAppFolder, ArtifactYamlFolderNames.scripts),
      translations: join(userAppFolder, ArtifactYamlFolderNames.translations),
    };

    await Promise.all([
      writeYamlFiles(yamlFolders.screens, app.screens ?? []),
      writeYamlFiles(yamlFolders.scripts, app.scripts ?? []),
      writeYamlFiles(yamlFolders.widgets, app.widgets ?? []),
      app.theme && writeYamlThemeFile(yamlFolders.theme, app.theme),
      writeYamlFiles(yamlFolders.translations, app.translations ?? []),
    ]);
  },
});

const readJsonFile = async <T>(filePath: string): Promise<T | undefined> => {
  try {
    if (!existsSync(filePath)) return undefined;

    const fileContents = await readFile(filePath, "utf-8");
    return JSON.parse(fileContents) as T;
  } catch (error) {
    return undefined;
  }
};

export const getAppMetaData = async (
  folderPath: string,
): Promise<ApplicationMetaDTO[]> => {
  try {
    const filePath = join(folderPath, AppManifestDataFile);

    // Check if the file exists
    if (!existsSync(filePath)) return [];

    const data = JSON.parse(
      await readFile(filePath, "utf-8"),
    ) as ApplicationMetaDTO[];

    const restoredData = data.map((app) => ({
      ...app,
      collaborators: new Map(Object.entries(app.collaborators ?? "")),
    }));

    return restoredData;
  } catch (error) {
    return [];
  }
};

const writeYamlFiles = async <T extends EnsembleDocument>(
  folderPath: string,
  artifact: T[],
): Promise<void> => {
  ensureDir(folderPath);

  const artifactMetaData: Record<string, string> = {};
  const filePromises = artifact.map(async (item) => {
    const yamlFilePath = join(folderPath, `${item.name}.yaml`);
    artifactMetaData[item.id] = item.name;
    if (!existsSync(yamlFilePath))
      await writeFile(yamlFilePath, item.content, "utf-8");
  });

  filePromises.push(
    writeJsonData(join(folderPath, HiddenManifestFile), artifactMetaData),
  );

  await Promise.all(filePromises);
};

const writeYamlThemeFile = async <T extends EnsembleDocument>(
  folderPath: string,
  artifact: T,
): Promise<void> => {
  ensureDir(folderPath);
  const yamlFilePath = join(folderPath, "Theme.yaml");
  const artifactMetaData = { [artifact.id]: "Theme.yaml" };
  if (!existsSync(yamlFilePath))
    await Promise.all([
      writeFile(yamlFilePath, artifact.content, "utf-8"),
      writeJsonData(join(folderPath, HiddenManifestFile), artifactMetaData),
    ]);
};

const readYamlContent = async (
  folderPath: string,
  artifactId: string,
): Promise<string> => {
  try {
    const filesMetaData = JSON.parse(
      await readFile(join(folderPath, HiddenManifestFile), "utf-8"),
    ) as Record<string, string>;
    const filePath = join(folderPath, `${filesMetaData[artifactId]}.yaml`);

    if (!existsSync(filePath)) return "";

    return await readFile(filePath, "utf-8");
  } catch (error) {
    return "";
  }
};

export const writeJsonData = async (
  filePath: string,
  data: unknown,
): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data), "utf-8");
};

export const convertJsonToMap = (
  data: Record<string, string>,
): Map<string, string> => {
  return new Map<string, string>(Object.entries(data));
};

export const ensureDir = (path: string): void => {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
};
