import type {
  DocumentData,
  DocumentReference,
  Firestore,
} from "firebase/firestore/lite";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { groupBy, head } from "lodash-es";
import type {
  AssetDTO,
  ApplicationDTO,
  ScreenDTO,
  ScriptDTO,
  ThemeDTO,
  WidgetDTO,
  LanguageDTO,
  EnvironmentDTO,
} from "./dto";
import type { ApplicationTransporter } from "./transporter";
import { CollectionsName, EnsembleDocumentType } from "./enums";

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

    const artifacts = await getArtifacts(appDocRef);

    const screens = artifacts[EnsembleDocumentType.Screen] as ScreenDTO[];
    const widgets = artifacts[EnsembleDocumentType.Widget] as WidgetDTO[];
    const scripts = artifacts[EnsembleDocumentType.Script] as ScriptDTO[];
    const theme = head(artifacts[EnsembleDocumentType.Theme]) as ThemeDTO;
    const languages = artifacts[EnsembleDocumentType.I18n] as LanguageDTO[];
    const assets = artifacts[EnsembleDocumentType.Asset] as AssetDTO[];
    const env = head(
      artifacts[EnsembleDocumentType.Environment],
    ) as EnvironmentDTO;

    return {
      ...app,
      isReact: app.isReact ?? false,
      screens,
      widgets,
      theme,
      scripts,
      translations: languages,
      assets,
      env,
    };
  },

  put: async (app: ApplicationDTO, userId: string): Promise<ApplicationDTO> => {
    const timestamp = Timestamp.now();
    const userRef = doc(db, CollectionsName.Users, userId);
    const appDocRef = doc(db, CollectionsName.Apps, app.id);
    const batch = writeBatch(db);
    const updatedByDetails = {
      updatedBy: userRef,
      updatedAt: timestamp,
    };

    batch.set(appDocRef, { ...app, ...updatedByDetails });

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

    await batch.commit();
    return app;
  },
});

const getArtifacts = async (
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
    artifactsByType[type]?.map((snapshot) => snapshot.data()) ?? [],
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
