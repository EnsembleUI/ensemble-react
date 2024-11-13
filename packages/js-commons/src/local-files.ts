import { join } from "node:path";
import { exec } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type { LocalApplicationTransporter } from "./transporter";
import {
  type ApplicationDTO,
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
  get: async (appId: string): Promise<ApplicationDTO> => {
    const userYamlAppFolder = await getYamlFolderPath(
      appId,
      yamlFolder,
      globalFolder,
    );
    const userAppFolder = join(userYamlAppFolder, EnsembleHiddenFolder);
    if (!existsSync(userAppFolder))
      throw Error("App data not found on user local disk.");

    const applicationData = await readJsonFile<ApplicationDTO>(
      join(userAppFolder, HiddenManifestFile),
    );

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

    const [themeYaml, screensYaml, scriptYaml, widgetYaml, translationsYaml] =
      await Promise.all([
        readYamlFiles(yamlFolders.theme),
        readYamlFiles(yamlFolders.screens),
        readYamlFiles(yamlFolders.scripts),
        readYamlFiles(yamlFolders.widgets),
        readYamlFiles(yamlFolders.translations),
      ]);

    const yamlApplicationData: ApplicationDTO = {
      ...applicationData,
      screens: applicationData.screens.map((screen) => {
        return { ...screen, content: screensYaml[screen.id] ?? "" };
      }),
      ...applicationData.scripts?.map((script) => {
        return { ...script, content: scriptYaml[script.id] ?? "" };
      }),
      ...applicationData.widgets?.map((widget) => {
        return { ...widget, content: widgetYaml[widget.id] ?? "" };
      }),
      ...(applicationData.theme && {
        theme: {
          ...applicationData.theme,
          content: themeYaml[applicationData.theme.id] ?? "",
        },
      }),
      ...applicationData.translations?.map((translation) => {
        return {
          ...translation,
          content: translationsYaml[translation.id] ?? "",
        };
      }),
    };

    return yamlApplicationData;
  },
  put: async (appData: ApplicationDTO): Promise<ApplicationDTO> => {
    const userYamlAppFolder = await getYamlFolderPath(
      appData.id,
      yamlFolder,
      globalFolder,
    );

    const userAppFolder = join(userYamlAppFolder, EnsembleHiddenFolder);
    ensureDir(userAppFolder);

    hideOnWindow(userAppFolder);

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

    await writeJsonData(join(userAppFolder, AppManifestDataFile), appData);

    await Promise.all([
      writeYamlFiles(yamlFolders.screens, appData.screens ?? []),
      writeYamlFiles(yamlFolders.scripts, appData.scripts ?? []),
      writeYamlFiles(yamlFolders.widgets, appData.widgets ?? []),
      appData.theme && writeYamlThemeFile(yamlFolders.theme, appData.theme),
      writeYamlFiles(yamlFolders.translations, appData.translations ?? []),
    ]);

    return appData;
  },
  updateYamlContent: async (
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

const readJsonFile = async <T>(filePath: string): Promise<T> => {
  const fileContents = await readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
};

const writeYamlFiles = async <T extends EnsembleDocument>(
  folderPath: string,
  artifact: T[],
): Promise<void> => {
  ensureDir(folderPath);

  const artifactMetaData: Record<string, string> = {};
  const filePromises = artifact.map(async (item) => {
    const yamlFilePath = join(folderPath, `${item.name}.yaml`);
    artifactMetaData[item.id] = `${item.name}.yaml`;
    await writeFile(yamlFilePath, item.content, "utf-8");
  });

  filePromises.push(
    writeJsonData(join(folderPath, HiddenManifestFile), artifactMetaData, true),
  );

  await Promise.all(filePromises);
};

const readYamlFiles = async (
  folderPath: string,
): Promise<Record<string, string>> => {
  const hiddenFile = join(folderPath, EnsembleHiddenFolder);

  try {
    const filesMetaData = JSON.parse(
      await readFile(hiddenFile, "utf-8"),
    ) as Record<string, string>;

    const fileContentEntries = await Promise.all(
      Object.entries(filesMetaData).map(async ([key, fileName]) => {
        try {
          const content = await readFile(join(folderPath, fileName), "utf-8");
          return [key, content];
        } catch {
          return [key, ""];
        }
      }),
    );

    return Object.fromEntries(fileContentEntries) as Record<string, string>;
  } catch {
    return {};
  }
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
      writeJsonData(
        join(folderPath, HiddenManifestFile),
        artifactMetaData,
        true,
      ),
    ]);
};

const getYamlFolderPath = async (
  appId: string,
  yamlFolder: string,
  globalFolder: string,
): Promise<string> => {
  const globalMetaData = await getAppsMetaData(globalFolder);
  const appMetaData = globalMetaData.find((app) => app.id === appId);
  if (!appMetaData) throw Error("App data not found on user local disk.");

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

// On Windows you need to hide file/folder by attributes
const hideOnWindow = (path: string): void => {
  if (!existsSync(path) && process.platform === "win32")
    exec(`attrib +h "${path}"`);
};

const writeJsonData = async (
  filePath: string,
  data: unknown,
  hideFile = false,
): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data), "utf-8");

  if (hideFile) hideOnWindow(filePath);
};

const ensureDir = (path: string): void => {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
};
