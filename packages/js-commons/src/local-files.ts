import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type {
  YamlApplicationTransporter,
  LocalApplicationTransporter,
} from "./transporter";
import {
  type ThemeDTO,
  type AssetDTO,
  type ScreenDTO,
  type WidgetDTO,
  type ScriptDTO,
  type TranslationDTO,
  type ApplicationDTO,
  type EnvironmentDTO,
  type EnsembleDocument,
  type ApplicationMetaDTO,
  EnsembleDocumentType,
} from "./dto";

export const EnsembleHiddenFolder = ".ensemble";
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

export const getLocalApplicationTransporter = (
  yamlFolder: string,
  globalFolder: string,
): LocalApplicationTransporter => ({
  get: async (appId: string): Promise<ApplicationDTO | null> => {
    try {
      const userYamlAppFolder = await getYamlFolderPath(
        appId,
        yamlFolder,
        globalFolder,
      );
      const userAppFolder = join(
        userYamlAppFolder,
        EnsembleHiddenFolder,
        appId,
      );
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
        readJsonFile<EnvironmentDTO>(
          join(userAppFolder, ArtifactFilesName.env),
        ),
        readJsonFile<ThemeDTO>(join(userAppFolder, ArtifactFilesName.theme)),
        readJsonFile<AssetDTO[]>(join(userAppFolder, ArtifactFilesName.assets)),
        readJsonFile<ScreenDTO[]>(
          join(userAppFolder, ArtifactFilesName.screens),
        ),
        readJsonFile<WidgetDTO[]>(
          join(userAppFolder, ArtifactFilesName.widgets),
        ),
        readJsonFile<ScriptDTO[]>(
          join(userAppFolder, ArtifactFilesName.scripts),
        ),
        readJsonFile<Record<string, string>>(
          join(userAppFolder, ArtifactFilesName.groupLabels),
        ),
        readJsonFile<TranslationDTO[]>(
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
        groupLabels: new Map(Object.entries(groupLabels ?? {})),
      };
      return applicationData;
    } catch (error) {
      return null;
    }
  },
  put: async (appData: ApplicationDTO): Promise<void> => {
    const userYamlAppFolder = await getYamlFolderPath(
      appData.id,
      yamlFolder,
      globalFolder,
    );

    const userAppFolder = join(
      userYamlAppFolder,
      EnsembleHiddenFolder,
      appData.id,
    );
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
    try {
      const userAppFolder = await getYamlFolderPath(
        appId,
        yamlFolder,
        globalFolder,
      );
      const filePath = await getYamlFilePath(
        documentId,
        documentType,
        userAppFolder,
      );

      if (!existsSync(filePath)) return "";
      return readFile(filePath, "utf-8");
    } catch (error) {
      return "";
    }
  },
  update: async (
    appId: string,
    documentId: string,
    documentType: string,
    content: string,
  ): Promise<void> => {
    const userAppFolder = await getYamlFolderPath(
      appId,
      yamlFolder,
      globalFolder,
    );

    const filePath = await getYamlFilePath(
      documentId,
      documentType,
      userAppFolder,
    );

    ensureDir(filePath);
    await writeFile(filePath, content, "utf-8");
  },
  put: async (app: ApplicationDTO): Promise<void> => {
    const userYamlAppFolder = await getYamlFolderPath(
      app.id,
      yamlFolder,
      globalFolder,
    );
    ensureDir(userYamlAppFolder);

    const yamlFolders = {
      theme: join(userYamlAppFolder, ArtifactYamlFolderNames.theme),
      screens: join(userYamlAppFolder, ArtifactYamlFolderNames.screens),
      widgets: join(userYamlAppFolder, ArtifactYamlFolderNames.widgets),
      scripts: join(userYamlAppFolder, ArtifactYamlFolderNames.scripts),
      translations: join(
        userYamlAppFolder,
        ArtifactYamlFolderNames.translations,
      ),
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

export const getAppsMetaData = async (
  globalFolderPath: string,
): Promise<ApplicationMetaDTO[]> => {
  try {
    const filePath = join(globalFolderPath, AppManifestDataFile);

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

export const setAppsMetaData = async (
  globalFolder: string,
  defaultYamlPath: string,
  appsMetaData: ApplicationMetaDTO[],
): Promise<void> => {
  // Write all apps manifest data in a single file
  if (appsMetaData.length) {
    let fileData: ApplicationMetaDTO[] = [];

    ensureDir(globalFolder);
    const filePath = join(globalFolder, AppManifestDataFile);

    if (existsSync(filePath))
      fileData = JSON.parse(
        await readFile(filePath, "utf-8"),
      ) as ApplicationMetaDTO[];

    const localPathMap = new Map(
      fileData.map((app) => [app.id, app.yamlFolderPath]),
    );

    // Convert the `collaborators` Map to an object for each app to store
    const transformedApps = appsMetaData.map((metaData) => {
      const yamlFolderPath = localPathMap.get(metaData.id);
      return {
        ...metaData,
        yamlFolderPath: yamlFolderPath ?? join(defaultYamlPath, metaData.name), // Add path if there's a match or a default path
        ...(metaData.collaborators && {
          collaborators: Object.fromEntries(metaData.collaborators),
        }),
      };
    });

    await writeJsonData(filePath, transformedApps);
  }
};

const readJsonFile = async <T>(filePath: string): Promise<T | undefined> => {
  try {
    if (!existsSync(filePath)) return undefined;

    const fileContents = await readFile(filePath, "utf-8");
    return JSON.parse(fileContents) as T;
  } catch (error) {
    return undefined;
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

const getYamlFolderPath = async (
  appId: string,
  yamlFolder: string,
  globalFolder: string,
): Promise<string> => {
  const appsMetaData = await getAppsMetaData(globalFolder);
  const appMetaData = appsMetaData.find((data) => data.id === appId);
  if (!appMetaData) throw Error("App not found on local disk.");

  const userAppFolder =
    appMetaData.yamlFolderPath ?? join(yamlFolder, appMetaData.name);

  return userAppFolder;
};

const getYamlFilePath = async (
  artifactId: string,
  documentType: string,
  userAppFolder: string,
): Promise<string> => {
  let folderPath = "";
  switch (documentType) {
    case EnsembleDocumentType.Screen:
      folderPath = join(userAppFolder, ArtifactYamlFolderNames.screens);
      break;
    case EnsembleDocumentType.Widget:
      folderPath = join(userAppFolder, ArtifactYamlFolderNames.widgets);
      break;
    case EnsembleDocumentType.Script:
      folderPath = join(userAppFolder, ArtifactYamlFolderNames.scripts);
      break;
    case EnsembleDocumentType.I18n:
      folderPath = join(userAppFolder, ArtifactYamlFolderNames.translations);
      break;
    case EnsembleDocumentType.Theme:
      folderPath = join(userAppFolder, ArtifactYamlFolderNames.theme);
  }

  const filesMetaData = JSON.parse(
    await readFile(join(folderPath, HiddenManifestFile), "utf-8"),
  ) as Record<string, string>;

  return folderPath
    ? join(folderPath, `${filesMetaData[artifactId]}.yaml`)
    : "";
};

const writeJsonData = async (
  filePath: string,
  data: unknown,
): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data), "utf-8");
};

const ensureDir = (path: string): void => {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
};
