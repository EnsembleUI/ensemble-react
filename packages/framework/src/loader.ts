import type { DocumentReference, Firestore } from "firebase/firestore/lite";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import type {
  ApplicationDTO,
  ScreenDTO,
  ScriptDTO,
  ThemeDTO,
  WidgetDTO,
  LanguageDTO,
  EnsembleConfigYAML,
} from "./shared/dto";
import { languageMap } from "./i18n";

const getArtifacts = async (
  appRef: DocumentReference,
): Promise<{
  screens: ScreenDTO[];
  widgets: WidgetDTO[];
  theme?: ThemeDTO;
  scripts: ScriptDTO[];
  languages?: LanguageDTO[];
  config?: EnsembleConfigYAML;
}> => {
  const snapshot = await getDocs(
    query(collection(appRef, "artifacts"), where("isArchived", "!=", true)),
  );
  const internalArtifactsSnapshot = await getDocs(
    query(
      collection(appRef, "internal_artifacts"),
      where("isArchived", "!=", true),
    ),
  );

  let theme;
  let config;
  const screens = [];
  const widgets = [];
  const scripts = [];
  const languages = [];
  for (const artifact of snapshot.docs) {
    const document = artifact.data();

    if (document.type === "screen") {
      screens.push({ ...document, id: artifact.id } as ScreenDTO);
    } else if (document.type === "theme") {
      theme = { ...document, id: artifact.id } as ThemeDTO;
    } else if (document.type === "i18n") {
      languages.push({
        name: languageMap[document.name as string],
        nativeName: languageMap[document.name as string],
        languageCode: document.name as string,
        content: document.content as string,
      });
    } else if (document.type === "config") {
      config = {
        environmentVariables: document.envVariables as {
          [key: string]: unknown;
        },
      };
    }
  }
  for (const artifact of internalArtifactsSnapshot.docs) {
    const artifactData = artifact.data();
    if (artifactData.type === "internal_widget") {
      widgets.push({ ...artifactData, id: artifact.id } as WidgetDTO);
    } else if (artifactData.type === "internal_script") {
      scripts.push({ ...artifactData, id: artifact.id } as ScriptDTO);
    }
  }
  return {
    screens,
    widgets,
    theme,
    scripts,
    languages,
    config,
  };
};

export interface ApplicationLoader {
  load: (appId: string) => Promise<ApplicationDTO>;
}

export const getFirestoreApplicationLoader = (
  db: Firestore,
): ApplicationLoader => ({
  load: async (appId: string): Promise<ApplicationDTO> => {
    const appDocRef = doc(db, "apps", appId);
    const appDoc = await getDoc(appDocRef);
    const app = {
      id: appDoc.id,
      ...appDoc.data(),
    } as ApplicationDTO;

    const { screens, widgets, theme, scripts, languages, config } =
      await getArtifacts(appDocRef);

    return {
      ...app,
      screens,
      widgets,
      theme,
      scripts,
      languages,
      config,
    };
  },
});
