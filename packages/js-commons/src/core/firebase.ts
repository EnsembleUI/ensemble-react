import type {
  DocumentData,
  DocumentReference,
  Firestore,
} from "firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  groupBy,
  head,
  isArray,
  isEmpty,
  isObject,
  isPlainObject,
  omit,
  omitBy,
  pick,
  set,
  toNumber,
} from "lodash-es";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArtifactProps, EnsembleDocumentType } from "./dto";
import type {
  AssetDTO,
  ApplicationDTO,
  ScreenDTO,
  ScriptDTO,
  WidgetDTO,
  TranslationDTO,
  ThemeDTO,
  HasManifest,
  FontDTO,
} from "./dto";
import type { ApplicationTransporter } from "./transporter";

export const getCloudApps = async (
  db: Firestore,
  userId: string,
): Promise<Partial<ApplicationDTO>[]> => {
  const q = query(
    collection(db, CollectionsName.Apps),
    where("isArchived", "==", false),
    where(`collaborators.users_${userId}`, "in", ["read", "write", "owner"]),
  );

  const result = await getDocs(q);
  return result.docs.map((app) => app.data());
};

export const getFirestoreApplicationTransporter = (
  db: Firestore,
): ApplicationTransporter => ({
  get: async (appId: string): Promise<ApplicationDTO> => {
    const appDocRef = doc(db, CollectionsName.Apps, appId);
    const appDoc = await getDoc(appDocRef);
    const app = {
      id: appDoc.id,
      ...omitNonPlainObjects(appDoc.data() ?? {}),
    } as ApplicationDTO;

    const artifactsByType = await getArtifactsByType(appDocRef);

    const screens = artifactsByType[EnsembleDocumentType.Screen] as ScreenDTO[];
    const widgets = artifactsByType[EnsembleDocumentType.Widget] as WidgetDTO[];
    const scripts = artifactsByType[EnsembleDocumentType.Script] as ScriptDTO[];
    const theme = head(artifactsByType[EnsembleDocumentType.Theme]) as ThemeDTO;
    const assets = artifactsByType[EnsembleDocumentType.Asset] as AssetDTO[];
    const fonts = artifactsByType[EnsembleDocumentType.Font] as FontDTO[];
    const translations = artifactsByType[
      EnsembleDocumentType.I18n
    ] as TranslationDTO[];
    const env = head(artifactsByType[EnsembleDocumentType.Environment]);
    const secrets = head(artifactsByType[EnsembleDocumentType.Secrets]);

    return {
      ...app,
      isReact: app.isReact ?? false,
      screens,
      widgets,
      theme,
      scripts,
      translations,
      assets,
      env,
      secrets,
      fonts,
      manifest: Object.fromEntries(
        Object.values(artifactsByType).flatMap((artifacts) =>
          artifacts.map((artifact) => [artifact.id, artifact]),
        ),
      ) as Pick<HasManifest, "manifest">,
    };
  },

  put: async (app: ApplicationDTO, userId: string): Promise<ApplicationDTO> => {
    const timestamp = Timestamp.now();
    const userRef = doc(db, CollectionsName.Users, userId);
    const appDocRef = doc(db, CollectionsName.Apps, app.id);
    const user = (await getDoc(userRef)).data();
    const updatedByDetails = {
      updatedBy: { id: userId, ...pick(user, "email", "name") },
      updatedAt: timestamp,
    };

    const sanitizedApp = omit<ApplicationDTO>(
      app,
      "projectPath",
      ...ArtifactProps,
    );
    if (!sanitizedApp.createdAt) {
      set(sanitizedApp, "createdAt", timestamp);
    }
    // App doc cannot be updated in batch because of firestore rules
    await setDoc(appDocRef, {
      ...sanitizedApp,
      // FIXME: apps use a different data structure from history
      ...{ updatedBy: userRef, updatedAt: updatedByDetails.updatedAt },
    });

    const batch = writeBatch(db);
    const artifactsRef = collection(appDocRef, CollectionsName.Artifacts);
    const internalArtifactsRef = collection(
      appDocRef,
      CollectionsName.InternalArtifacts,
    );

    const {
      screens,
      widgets,
      scripts,
      translations,
      theme,
      env,
      assets,
      fonts,
    } = app;

    screens.forEach((screen) => {
      const screenRef = doc(artifactsRef, screen.id);
      const history = doc(collection(screenRef, CollectionsName.History));
      const updatedScreen = {
        type: EnsembleDocumentType.Screen,
        name: screen.name,
        content: screen.content || "",
        isRoot: screen.isRoot,
        isArchived: screen.isArchived,
        ...updatedByDetails,
      };
      batch.set(screenRef, updatedScreen);
      batch.set(history, updatedScreen);
    });

    widgets?.forEach((widget) => {
      const widgetRef = doc(internalArtifactsRef, widget.id);
      const history = doc(collection(widgetRef, CollectionsName.History));
      const updatedWidget = {
        type: EnsembleDocumentType.Widget,
        name: widget.name,
        content: widget.content ?? "",
        isArchived: widget.isArchived,
        ...updatedByDetails,
      };
      batch.set(widgetRef, updatedWidget);
      batch.set(history, updatedWidget);
    });

    // Add theme
    if (theme) {
      const themeRef = doc(artifactsRef, theme.id);
      const updatedTheme = {
        type: EnsembleDocumentType.Theme,
        content: theme.content,
        isRoot: true,
        isArchived: theme.isArchived,
        ...updatedByDetails,
      };
      const history = doc(collection(themeRef, CollectionsName.History));
      batch.set(themeRef, updatedTheme);
      batch.set(history, updatedTheme);
    }

    scripts?.forEach((script) => {
      const scriptRef = doc(internalArtifactsRef, script.id);
      const history = doc(collection(scriptRef, CollectionsName.History));
      const updatedScript = {
        type: EnsembleDocumentType.Script,
        name: script.name,
        content: script.content ?? "",
        isArchived: script.isArchived,
        isRoot: true,
        ...updatedByDetails,
      };
      batch.set(scriptRef, updatedScript);
      batch.set(history, updatedScript);
    });

    translations?.forEach((translation) => {
      const translationRef = doc(artifactsRef, translation.id);
      const history = doc(collection(translationRef, CollectionsName.History));
      const updatedTranslation = {
        ...translation,
        ...updatedByDetails,
        type: EnsembleDocumentType.I18n,
        defaultLocale: translation.defaultLocale,
      };
      batch.set(translationRef, updatedTranslation);
      batch.set(history, updatedTranslation);
    });

    if (env) {
      batch.set(
        doc(artifactsRef, "appConfig"),
        {
          type: EnsembleDocumentType.Environment,
          envVariables: env,
          isRoot: true,
          isArchived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: userRef,
          updatedBy: userRef,
        },
        { merge: true },
      );
    }

    await batch.commit();

    const assetPromises = assets?.map((asset) =>
      firestoreStoreAsset(db.app, app.id, asset.fileName, asset.content),
    );
    if (assetPromises) await Promise.all(assetPromises);

    const fontPromises = fonts?.map((font) =>
      firestoreStoreAsset(db.app, app.id, font.name, font.content, {
        fontFamily: font.fontFamily,
        fontWeight: toNumber(font.fontWeight),
        fontStyle: font.fontStyle,
        fontType: font.fontType,
      }),
    );
    if (fontPromises) await Promise.all(fontPromises);

    return app;
  },
});

export const firestoreStoreAsset = async (
  app: Firestore["app"],
  appId: string,
  fileName: string,
  fileData: string | Buffer,
  font?: {
    fontFamily?: string;
    fontWeight?: number;
    fontStyle?: string;
    fontType?: string;
  },
): Promise<void> => {
  const cloudFunction = httpsCallable(
    getFunctions(app),
    !isEmpty(font) ? "studio-addFont" : "studio-uploadAsset",
  );
  await cloudFunction({
    appId,
    fileName,
    fileData,
    ...(!isEmpty(font)
      ? {
          fontFamily: font.fontFamily,
          weight: font.fontWeight,
          type: font.fontStyle,
          fontType: font.fontType,
        }
      : {}),
  });
};

export const firestoreRemoveAsset = async (
  app: Firestore["app"],
  appId: string,
  documentId: string,
): Promise<void> => {
  const cloudFunction = httpsCallable(getFunctions(app), "studio-deleteAsset");
  await cloudFunction({
    appId,
    documentId,
  });
};

const getArtifactsByType = async (
  appRef: DocumentReference,
): Promise<Record<EnsembleDocumentType, DocumentData[]>> => {
  const [artifactsSnapshot, internalArtifactsSnapshot, labelsSnapshot] =
    await Promise.all([
      getDocs(
        query(
          collection(appRef, CollectionsName.Artifacts),
          QUERY_FILTERS.notArchived,
        ),
      ),
      getDocs(
        query(
          collection(appRef, CollectionsName.InternalArtifacts),
          QUERY_FILTERS.notArchived,
        ),
      ),
      getDocs(
        query(
          collection(appRef, CollectionsName.Labels),
          QUERY_FILTERS.notArchived,
        ),
      ),
    ]);

  const artifactsByType = groupBy(
    [...artifactsSnapshot.docs, ...internalArtifactsSnapshot.docs],
    (artifactDoc) => String(artifactDoc.get("type")),
  );

  const knownArtifacts = Object.values(EnsembleDocumentType).map<
    [EnsembleDocumentType, DocumentData[]]
  >((type) => [
    type,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    artifactsByType[type]?.map((snapshot) => ({
      id: snapshot.id,
      ...omitNonPlainObjects(snapshot.data()),
    })) ?? [],
  ]);

  const labels = labelsSnapshot.docs.map((label) => {
    return { id: label.id, name: String(label.data().name) };
  });
  knownArtifacts.push([EnsembleDocumentType.Label, labels]);

  return Object.fromEntries(knownArtifacts) as Record<
    EnsembleDocumentType,
    DocumentData[]
  >;
};

const QUERY_FILTERS = {
  notArchived: where("isArchived", "!=", true),
};

export enum CollectionsName {
  Apps = "apps",
  Users = "users",
  Labels = "labels",
  History = "history",
  Artifacts = "artifacts",
  InternalArtifacts = "internal_artifacts",
}

// Firebase docuemnts contain non plain objects that create issues when serializing
// TODO: convert them to plain objects instead?
const omitNonPlainObjects = (maybeClass: object): object =>
  omitBy(
    maybeClass,
    (value) => isObject(value) && !isArray(value) && !isPlainObject(value),
  );
