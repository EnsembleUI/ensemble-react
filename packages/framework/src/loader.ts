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
} from "./shared/dto";

export const languageMap: { [key: string]: string } = {
  ar: "Arabic",
  bn: "Bengali",
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  hi: "Hindi",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  jv: "Javanese",
  ko: "Korean",
  ms: "Malay",
  nl: "Dutch",
  pa: "Punjabi",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sv: "Swedish",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  zh: "Chinese",
  el: "Greek",
  da: "Danish",
};

const getArtifacts = async (
  appRef: DocumentReference,
): Promise<{
  screens: ScreenDTO[];
  widgets: WidgetDTO[];
  theme?: ThemeDTO;
  scripts: ScriptDTO[];
  languages?: LanguageDTO[];
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

    const { screens, widgets, theme, scripts, languages } =
      await getArtifacts(appDocRef);
    return {
      ...app,
      screens,
      widgets,
      theme,
      scripts,
      languages,
    };
  },
});
