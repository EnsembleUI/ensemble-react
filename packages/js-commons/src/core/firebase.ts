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
  isObject,
  isPlainObject,
  omit,
  omitBy,
  set,
} from "lodash-es";
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
} from "./dto";
import type { ApplicationTransporter } from "./transporter";

export const getFirestoreApplicationTransporter = (
  db: Firestore,
): ApplicationTransporter => ({
  get: async (appId: string): Promise<ApplicationDTO> => {
    const appDocRef = doc(db, CollectionsName.Apps, appId);
    const appDoc = await getDoc(appDocRef);
    const app = {
      id: appDoc.id,
      ...appDoc.data(),
    } as ApplicationDTO;

    const artifactsByType = await getArtifactsByType(appDocRef);

    const screens = artifactsByType[EnsembleDocumentType.Screen] as ScreenDTO[];
    const widgets = artifactsByType[EnsembleDocumentType.Widget] as WidgetDTO[];
    const scripts = artifactsByType[EnsembleDocumentType.Script] as ScriptDTO[];
    const theme = head(artifactsByType[EnsembleDocumentType.Theme]) as ThemeDTO;
    const assets = artifactsByType[EnsembleDocumentType.Asset] as AssetDTO[];
    const translations = artifactsByType[
      EnsembleDocumentType.I18n
    ] as TranslationDTO[];
    const env = head(artifactsByType[EnsembleDocumentType.Environment]);

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
    const updatedByDetails = {
      updatedBy: userRef,
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
    await setDoc(appDocRef, { ...sanitizedApp, ...updatedByDetails });

    const batch = writeBatch(db);
    const artifactsRef = collection(appDocRef, CollectionsName.Artifacts);
    const internalArtifactsRef = collection(
      appDocRef,
      CollectionsName.InternalArtifacts,
    );

    const { screens, widgets, scripts, translations, theme, env } = app;

    screens.forEach((screen) => {
      const screenRef = doc(artifactsRef, screen.id);
      batch.set(screenRef, {
        type: EnsembleDocumentType.Screen,
        name: screen.name,
        content: screen.content || "",
        isRoot: screen.isRoot,
        isArchived: screen.isArchived,
        ...updatedByDetails,
      });
    });

    widgets?.forEach((widget) =>
      batch.set(doc(internalArtifactsRef, widget.id), {
        type: EnsembleDocumentType.Widget,
        name: widget.name,
        content: widget.content ?? "",
        isArchived: widget.isArchived,
        ...updatedByDetails,
      }),
    );

    // Add theme
    if (theme) {
      batch.set(doc(artifactsRef, theme.id), {
        type: EnsembleDocumentType.Theme,
        content: theme.content,
        isRoot: true,
        isArchived: theme.isArchived,
        ...updatedByDetails,
      });
    }

    scripts?.forEach((script) =>
      batch.set(doc(internalArtifactsRef, script.id), {
        type: EnsembleDocumentType.Script,
        name: script.name,
        content: script.content ?? "",
        isArchived: script.isArchived,
        isRoot: true,
        ...updatedByDetails,
      }),
    );

    translations?.forEach((translation) =>
      batch.set(doc(internalArtifactsRef, translation.id), {
        ...translation,
        ...updatedByDetails,
        type: EnsembleDocumentType.I18n,
        defaultLocale: translation.defaultLocale,
      }),
    );

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
    return app;
  },
});

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
      ...omitBy(
        snapshot.data(),
        (value) => isObject(value) && !isArray(value) && !isPlainObject(value),
      ),
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
