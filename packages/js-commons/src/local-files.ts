import { join } from "node:path";
import { exec } from "node:child_process";
import { homedir } from "node:os";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { compact, groupBy } from "lodash-es";
import type { LocalApplicationTransporter } from "./transporter";
import { EnsembleDocumentType } from "./dto";
import type {
  AssetDTO,
  ScreenDTO,
  ScriptDTO,
  TranslationDTO,
  WidgetDTO,
  ApplicationDTO,
  EnsembleDocument,
  EnvironmentDTO,
  ThemeDTO,
  HasManifest,
} from "./dto";

// Lookup where to find each app on the local FS
const GLOBAL_MANIFEST_FILE = "local-apps-manifest.json";
type EnsembleGlobalMetadata = Record<string, ApplicationLocalMeta | undefined>;

const APP_MANIFEST_FILE = ".manifest.json";
type ApplicationLocalMeta = ApplicationDTO & {
  // TODO: extend with sync properties, i.e. last sync time
  projectPath: string;
};

let METADATA_DIR = join(homedir(), ".ensemble");

export const getLocalApplicationTransporter = (
  ensembleDir: string = METADATA_DIR,
): LocalApplicationTransporter => {
  METADATA_DIR = ensembleDir;
  return {
    get: async (appId: string): Promise<ApplicationDTO> => {
      const appsMetaData = await getGlobalMetadata();
      const existingAppMetadata = appsMetaData[appId];
      if (!existingAppMetadata) {
        throw Error(`App ${appId} not found on local disk`);
      }
      const appMetadata = await getAppManifest(existingAppMetadata.projectPath);

      const documentReads = Object.values(appMetadata.manifest ?? {}).map(
        async (document) => {
          if (!document.type) {
            return;
          }
          const subDir = join(existingAppMetadata.projectPath, document.type);
          let filePath;
          if (document.relativePath) {
            filePath = join(subDir, document.relativePath);
          } else if (document.name) {
            filePath = join(subDir, `${document.name}.yaml`);
          } else if (document.id) {
            filePath = join(subDir, `${document.id}.yaml`);
          } else {
            return;
          }
          const content = await readFile(filePath, { encoding: "utf-8" });
          return {
            ...document,
            content,
          } as EnsembleDocument;
        },
      );

      const documents = compact(await Promise.all(documentReads));
      const docsByType = groupBy(documents, (doc) => doc.type);
      return {
        ...existingAppMetadata,
        screens: docsByType[EnsembleDocumentType.Screen] as ScreenDTO[],
        widgets: docsByType[EnsembleDocumentType.Widget] as WidgetDTO[],
        scripts: docsByType[EnsembleDocumentType.Script] as ScriptDTO[],
        assets: docsByType[EnsembleDocumentType.Asset] as AssetDTO[],
        translations: docsByType[EnsembleDocumentType.I18n] as TranslationDTO[],
        env: docsByType[EnsembleDocumentType.Environment][0] as EnvironmentDTO,
        theme: docsByType[EnsembleDocumentType.Theme][0] as ThemeDTO,
      };
    },

    put: async (
      appData: ApplicationDTO,
      path?: string,
    ): Promise<ApplicationDTO> => {
      ensureDir(ensembleDir);
      const appsMetaData = await getGlobalMetadata();
      const existingAppMetadata = appsMetaData[appData.id]
        ? { projectPath: path, ...appsMetaData[appData.id], appData }
        : { ...appData, projectPath: path };
      if (path) {
        existingAppMetadata.projectPath = path;
      } else {
        existingAppMetadata.projectPath = join(ensembleDir, appData.id);
      }

      const yamlFileWrites = Object.values(appData.manifest ?? {}).map(
        async (document) => {
          const { relativePath } = await saveArtifact(
            document as EnsembleDocument,
            appData.id,
            {
              skipMetadata: true,
            },
          );
          return {
            ...document,
            relativePath,
          };
        },
      );

      const documents = await Promise.all(yamlFileWrites);
      await setAppManifest(
        {
          ...existingAppMetadata,
          manifest: Object.fromEntries(
            documents.map((doc) => [doc.id, doc]),
          ) as Pick<HasManifest, "manifest">,
        },
        existingAppMetadata.projectPath,
      );

      await setGlobalMetadata(appsMetaData);
      return appData;
    },
  };
};

export const saveArtifact = async (
  artifact: EnsembleDocument,
  appId: string,
  options: {
    relativePath?: string;
    skipMetadata?: boolean;
  } = {
    skipMetadata: false,
  },
): Promise<{ relativePath: string }> => {
  const appsMetaData = await getGlobalMetadata();
  const existingAppMetadata = appsMetaData[appId];

  if (!existingAppMetadata?.manifest) {
    throw new Error(`App ${appId} does not exist locally`);
  }
  const existingPath = existingAppMetadata.manifest[artifact.id].relativePath;

  // TODO: allow custom project structures
  const artifactSubDir = join(existingAppMetadata.projectPath, artifact.type);
  ensureDir(artifactSubDir);
  let pathToWrite = existingPath;
  if (options.relativePath) {
    pathToWrite = options.relativePath;
  }
  if (!pathToWrite) {
    pathToWrite = `${artifact.name}.yaml`;
  }

  await writeFile(join(artifactSubDir, pathToWrite), artifact.content, "utf-8");

  if (!options.skipMetadata) {
    existingAppMetadata.manifest[artifact.id] = {
      ...artifact,
      relativePath: pathToWrite,
    };

    await setGlobalMetadata(appsMetaData);
  }
  return { relativePath: pathToWrite };
};

const getGlobalMetadata = async (): Promise<EnsembleGlobalMetadata> => {
  const filePath = join(METADATA_DIR, GLOBAL_MANIFEST_FILE);

  // Check if the file exists
  if (!existsSync(filePath)) {
    return {};
  }

  const metadata = readJsonFile<EnsembleGlobalMetadata>(filePath);
  return metadata;
};

const setGlobalMetadata = async (
  metadata: EnsembleGlobalMetadata,
): Promise<void> => {
  ensureDir(METADATA_DIR);
  const filePath = join(METADATA_DIR, GLOBAL_MANIFEST_FILE);

  await writeJsonData(filePath, metadata);
};

const getAppManifest = async (projectPath: string): Promise<HasManifest> => {
  const filePath = join(projectPath, APP_MANIFEST_FILE);

  // Check if the file exists
  if (!existsSync(filePath)) {
    return {};
  }

  const manifest = readJsonFile<ApplicationLocalMeta>(filePath);
  return manifest;
};

const setAppManifest = async (
  manifest: HasManifest,
  projectPath: string,
): Promise<void> => {
  ensureDir(projectPath);

  const filePath = join(METADATA_DIR, APP_MANIFEST_FILE);

  await writeJsonData(filePath, manifest, true);
};

const readJsonFile = async <T>(filePath: string): Promise<T> => {
  const fileContents = await readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
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
