import type { Firestore } from "firebase/firestore/lite";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore/lite";
import type { ApplicationDTO } from "./shared";

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
