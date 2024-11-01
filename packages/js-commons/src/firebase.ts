import type { DocumentReference, Firestore } from "firebase/firestore/lite";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import type {
  ApplicationDTO,
  ScreenDTO,
  ScriptDTO,
  ThemeDTO,
  WidgetDTO,
  LanguageDTO,
  EnsembleConfigYAML,
  FontDTO,
} from "./dto";

const getArtifacts = async (
  appRef: DocumentReference,
): Promise<{
  screens: ScreenDTO[];
  widgets: WidgetDTO[];
  theme?: ThemeDTO;
  scripts: ScriptDTO[];
  languages?: LanguageDTO[];
  config?: EnsembleConfigYAML;
  fonts?: FontDTO[];
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
  let config = {};
  const screens = [];
  const widgets = [];
  const scripts = [];
  const languages = [];
  const fonts = [];
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
        ...config,
        environmentVariables: document.envVariables as Record<string, unknown>,
      };
    } else if (document.type === "secrets") {
      config = {
        ...config,
        secretVariables: document.secrets as Record<string, unknown>,
      };
    } else if (document.type === "font") {
      const font = document as FontDTO;

      fonts.push({
        ...font,
        fontFamily: font.fontFamily,
        publicUrl: font.publicUrl,
        fontWeight: font.fontWeight.replace(/[^0-9]/g, ""), // this is required, because font face only accept number in font face and we are getting string from the firebase (ex. weight: '400 (normal)')
        fontStyle: font.fontStyle,
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
    config,
    fonts,
  };
};

export interface ApplicationLoader {
  load: (appId: string) => Promise<ApplicationDTO>;
  write: (app: ApplicationDTO) => Promise<ApplicationDTO>;
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

    const { screens, widgets, theme, scripts, languages, config, fonts } =
      await getArtifacts(appDocRef);

    return {
      ...app,
      screens,
      widgets,
      theme,
      scripts,
      languages,
      config,
      fonts,
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(app: ApplicationDTO): Promise<ApplicationDTO> {
    throw new Error("Function not implemented.");
  },
});

export const languageMap: Record<string, string> = {
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

export const serializeApp = async (
  db: Firestore,
  app: ApplicationDTO,
  userId: string,
) => {
  const appDocRef = doc(db, "apps", app.id);
  const { screens, widgets, theme, scripts, ...appData } = app;
  await setDoc(appDocRef, {
    ...appData,
    isReact: true,
    isPublic: false,
    isArchived: false,
    collaborators: { [`users_${userId}`]: "owner" },
  });

  const batch = writeBatch(db);
  screens.forEach((screen) => {
    const screenRef = doc(collection(appDocRef, "artifacts"));
    batch.set(
      screenRef,
      {
        ...screen,
        type: "screen",
        isPublic: false,
        isArchived: false,
      },
      {
        merge: true,
      },
    );
  });

  widgets.forEach((widget) => {
    const widgetRef = doc(collection(appDocRef, "internal_artifacts"));
    batch.set(
      widgetRef,
      {
        ...widget,
        type: "internal_widget",
        isPublic: false,
        isArchived: false,
      },
      {
        merge: true,
      },
    );
  });

  scripts.forEach((script) => {
    const scriptRef = doc(collection(appDocRef, "internal_artifacts"));
    batch.set(
      scriptRef,
      {
        ...script,
        type: "internal_script",
        isPublic: false,
        isArchived: false,
      },
      {
        merge: true,
      },
    );
  });

  const newThemeRef = doc(collection(appDocRef, "artifacts"));
  batch.set(
    newThemeRef,
    {
      ...theme,
      type: "theme",
      isPublic: false,
      isArchived: false,
    },
    {
      merge: true,
    },
  );
  await batch.commit();
};
