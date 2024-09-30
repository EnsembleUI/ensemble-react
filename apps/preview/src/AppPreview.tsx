import type {
  ApplicationDTO,
  ApplicationLoader,
  EnsembleDocument,
} from "@ensembleui/react-framework";
import { getFirestoreApplicationLoader } from "@ensembleui/react-framework";
import { EnsembleApp } from "@ensembleui/react-runtime";
import { Alert } from "antd";
import { isString, set } from "lodash-es";
import type { Firestore } from "firebase/firestore/lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppConsole } from "./useAppConsole";

const customWidgetPreviewScaffold = `
View:
  body:
    Column:
      children:
        - @@WIDGET@@
`;

const customWidgetScreenTemplate = {
  id: "preview",
  name: "home",
  content: customWidgetPreviewScaffold,
};

const customPreviewWidgetApp: ApplicationDTO = {
  screens: [customWidgetScreenTemplate],
  widgets: [],
  scripts: [],
  id: "customWidgetPreview",
  name: "customWidgetPreview",
};

const createCustomWidgetPreviewApp = (
  app: ApplicationDTO,
  customWidget: EnsembleDocument,
): ApplicationDTO => {
  const screen = {
    ...customWidgetScreenTemplate,
    content: customWidgetScreenTemplate.content.replace(
      "@@WIDGET@@",
      `${customWidget.name}:`,
    ),
  };
  const customApp: ApplicationDTO = {
    ...customPreviewWidgetApp,
    config: app.config,
    theme: app.theme,
    screens: [screen],
    widgets: [customWidget],
    languages: app.languages,
  };
  return customApp;
};

export const AppPreview: React.FC<{ db: Firestore }> = ({ db }) => {
  const { previewId } = useParams();
  const [searchParams] = useSearchParams();
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [bypassCache, setBypassCache] = useState<boolean>(true);

  const artifactId =
    searchParams.get("artifactId") ?? searchParams.get("screenId");
  const loader = useMemo(() => {
    const firestoreLoader = getFirestoreApplicationLoader(db);
    const loaderWithCache: ApplicationLoader = {
      load: async (appId: string) => {
        if (bypassCache) {
          const app = await firestoreLoader.load(appId);
          localStorage.setItem(
            `ensemble-react.preview.${appId}`,
            JSON.stringify(app),
          );
          const matchingWidget = app.widgets.find(
            (widget) => widget.id === artifactId,
          );
          if (matchingWidget) {
            return createCustomWidgetPreviewApp(app, matchingWidget);
          }
          return app;
        }

        const serializedApp = localStorage.getItem(
          `ensemble-react.preview.${appId}`,
        );
        if (!serializedApp) {
          throw Error(`${appId} does not exist in cache!`);
        }
        const hydratedApp = JSON.parse(serializedApp) as ApplicationDTO;
        const matchingWidget = hydratedApp.widgets.find(
          (widget) => widget.id === artifactId,
        );
        const matchingScreen = hydratedApp.screens.find(
          (screen) => screen.id === artifactId,
        );
        if (artifactId) {
          const cachedArtifact = localStorage.getItem(`flutter.${artifactId}`);
          if (cachedArtifact) {
            if (matchingWidget) {
              set(matchingWidget, "content", JSON.parse(cachedArtifact));
              return createCustomWidgetPreviewApp(hydratedApp, matchingWidget);
            }
            if (matchingScreen) {
              set(matchingScreen, "content", JSON.parse(cachedArtifact));
            }
          }
        }
        return hydratedApp;
      },
    };
    return loaderWithCache;
  }, [bypassCache, db, artifactId]);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (!isString(e.data)) {
        return;
      }
      try {
        const msg = JSON.parse(e.data) as {
          type?: string;
          bypassCache: boolean;
          screen?: {
            id: string;
            content: string;
          };
        };
        if (msg.type === "reload") {
          setBypassCache(msg.bypassCache);
          setRefreshCount(refreshCount + 1);
          if (msg.screen) {
            localStorage.setItem(
              `flutter.${msg.screen.id}`,
              msg.screen.content,
            );
          }
        }
      } catch (err) {
        /* empty */
      }
    },
    [refreshCount],
  );
  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  useAppConsole();

  if (!previewId) {
    return <Alert message="An app id must be provided" type="error" />;
  }
  return (
    <EnsembleApp
      appId={previewId}
      key={refreshCount}
      loader={loader}
      path={`/preview/${previewId}`}
      screenId={artifactId ?? undefined}
    />
  );
};
