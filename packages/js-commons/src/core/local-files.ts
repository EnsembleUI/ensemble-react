import { join } from "node:path";
import { exec } from "node:child_process";
import { homedir } from "node:os";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import {
  compact,
  groupBy,
  head,
  isArray,
  isNil,
  omit,
  pick,
  values,
} from "lodash-es";
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
  FontDTO,
} from "./dto";

// Lookup where to find each app on the local FS
const GLOBAL_MANIFEST_FILE = "local-apps-manifest.json";
type EnsembleGlobalMetadata = Record<string, ApplicationLocalMeta | undefined>;

const APP_MANIFEST_FILE = ".manifest.json";
export type ApplicationLocalMeta = ApplicationDTO & {
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

          let content = "";
          if (
            document.type !== EnsembleDocumentType.Asset &&
            document.type !== EnsembleDocumentType.Font
          ) {
            content = await readFile(filePath, { encoding: "utf-8" });
          }

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
        fonts: docsByType[EnsembleDocumentType.Font] as FontDTO[],
        translations: docsByType[EnsembleDocumentType.I18n] as TranslationDTO[],
        env: head(
          docsByType[EnsembleDocumentType.Environment],
        ) as EnvironmentDTO,
        theme: head(docsByType[EnsembleDocumentType.Theme]) as ThemeDTO,
      };
    },

    put: async (
      appData: ApplicationDTO,
      path?: string,
    ): Promise<ApplicationDTO> => {
      ensureDir(ensembleDir);
      const updatedAppData = omit(appData, ["assets", "fonts"]);
      const appsMetaData = await getGlobalMetadata();
      const existingAppMetadata = (
        appsMetaData[appData.id]
          ? {
              projectPath: path,
              ...appsMetaData[appData.id],
              ...updatedAppData,
            }
          : { ...updatedAppData, projectPath: path }
      ) as ApplicationLocalMeta;
      if (path) {
        existingAppMetadata.projectPath = path;
      } else {
        existingAppMetadata.projectPath = join(ensembleDir, appData.id);
      }

      const documentsToWrite = values(
        pick(appData, [
          "screens",
          "widgets",
          "scripts",
          "translations",
          "env",
          "theme",
        ]),
      ).flatMap((docset: unknown) => {
        if (isArray(docset)) {
          return docset as EnsembleDocument[];
        }
        if (!isNil(docset)) {
          return [docset as EnsembleDocument];
        }
        return [];
      });

      const yamlFileWrites = compact(documentsToWrite).map(async (document) => {
        const { relativePath } = await saveArtifact(
          document,
          existingAppMetadata,
          {
            skipMetadata: true,
          },
        );
        return {
          ...document,
          relativePath,
        };
      });

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

      appsMetaData[appData.id] = existingAppMetadata;
      await setGlobalMetadata(appsMetaData);
      return appData;
    },

    storeAsset: async (
      appId: string,
      fileName: string,
      fileData: string | Buffer,
      isFont = false,
      fontFamily?: string,
      weight?: number,
      fontStyle?: string,
      fontType?: string,
    ): Promise<void> => {
      const appsMetadata = await getGlobalMetadata();
      const appMetadata = appsMetadata[appId];
      if (!appMetadata) {
        throw new Error(`App ${appId} not found in local metadata`);
      }

      const assetDir = join(
        appMetadata.projectPath,
        isFont ? EnsembleDocumentType.Font : EnsembleDocumentType.Asset,
      );
      ensureDir(assetDir);

      const assetPath = join(assetDir, fileName);
      const assetDocument = {
        id: fileName,
        name: fileName,
        fileName,
        isArchived: false,
        type: isFont ? EnsembleDocumentType.Font : EnsembleDocumentType.Asset,
        content: "",
        publicUrl: assetPath,
        fontFamily,
        weight,
        fontType,
        fontStyle,
      } as EnsembleDocument;

      await writeFile(assetPath, fileData); // write the file to disk
      await writeFile(
        join(assetDir, `${fileName}.json`),
        JSON.stringify(assetDocument),
      ); // write file's metadata separately in json

      await saveArtifact(assetDocument, appMetadata, {
        relativePath: fileName,
      });
    },

    removeAsset: async (
      appId: string,
      documentId: string,
      isFont = false,
      fileName?: string,
    ): Promise<void> => {
      const appsMetadata = await getGlobalMetadata();
      const appMetadata = appsMetadata[appId];
      if (!appMetadata) {
        throw new Error(`App ${appId} not found in local metadata`);
      }

      const assetDir = join(
        appMetadata.projectPath,
        isFont ? EnsembleDocumentType.Font : EnsembleDocumentType.Asset,
      );
      ensureDir(assetDir);

      const assetPath = join(assetDir, fileName || documentId);
      if (existsSync(assetPath)) {
        unlinkSync(assetPath);
      }

      const metadataPath = join(assetDir, `${fileName || documentId}.json`);
      if (existsSync(metadataPath)) {
        unlinkSync(metadataPath);
      }

      const manifest = await getAppManifest(appMetadata.projectPath);
      if (manifest.manifest) {
        delete manifest.manifest[fileName || documentId];
        await setAppManifest(manifest, appMetadata.projectPath);
      }
    },
  };
};

export const saveArtifact = async (
  artifact: EnsembleDocument,
  app: ApplicationLocalMeta,
  options: {
    relativePath?: string;
    skipMetadata?: boolean;
  } = {
    skipMetadata: false,
  },
): Promise<{ relativePath: string }> => {
  if (!app.manifest) {
    app.manifest = {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const existingPath = app.manifest[artifact.id]?.relativePath;

  // TODO: allow custom project structures
  const artifactSubDir = join(app.projectPath, artifact.type);
  ensureDir(artifactSubDir);
  let pathToWrite = existingPath;
  if (options.relativePath) {
    pathToWrite = options.relativePath;
  }
  if (!pathToWrite) {
    pathToWrite = `${artifact.name}.yaml`;
  }

  if (
    artifact.type !== EnsembleDocumentType.Asset &&
    artifact.type !== EnsembleDocumentType.Font
  ) {
    await writeFile(
      join(artifactSubDir, pathToWrite),
      artifact.content,
      "utf-8",
    );
  }

  if (!options.skipMetadata) {
    const existingManifest = await getAppManifest(app.projectPath);
    const updatedManifest = {
      ...existingManifest,
      manifest: {
        ...(existingManifest.manifest || {}),
        [artifact.id]: {
          ...artifact,
          relativePath: pathToWrite,
        },
      },
    };

    await setAppManifest(updatedManifest, app.projectPath);
  }
  return { relativePath: pathToWrite };
};

export const getGlobalMetadata = async (): Promise<EnsembleGlobalMetadata> => {
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

  const filePath = join(projectPath, APP_MANIFEST_FILE);

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
