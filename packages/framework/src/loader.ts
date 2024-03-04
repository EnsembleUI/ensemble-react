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
  ThemeDTO,
  WidgetDTO,
} from "./shared/dto";

const getArtifacts = async (
  appRef: DocumentReference,
): Promise<{
  screens: ScreenDTO[];
  widgets: WidgetDTO[];
  theme?: ThemeDTO;
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
  for (const artifact of snapshot.docs) {
    const document = artifact.data();
    if (document.type === "screen") {
      screens.push({ id: artifact.id, ...document } as ScreenDTO);
    } else if (document.type === "theme") {
      theme = { id: artifact.id, ...document } as ThemeDTO;
    }
  }
  for (const artifact of internalArtifactsSnapshot.docs) {
    const artifactData = artifact.data();
    if (artifactData.type === "internal_widget") {
      widgets.push({ id: artifact.id, ...artifactData } as WidgetDTO);
    }
  }
  return {
    screens,
    widgets,
    theme,
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

    const { screens, widgets, theme } = await getArtifacts(appDocRef);
    return {
      ...app,
      screens,
      widgets,
      theme: theme ? [theme] : undefined,
      scripts: [],
    };
  },
});
