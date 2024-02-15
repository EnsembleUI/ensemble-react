import type {
  ApplicationDTO,
  ApplicationLoader,
} from "@ensembleui/react-framework";
import { getFirestoreApplicationLoader } from "@ensembleui/react-framework";
import { EnsembleApp } from "@ensembleui/react-runtime";
import { Alert } from "antd";
import { isString, set } from "lodash-es";
import type { Firestore } from "firebase/firestore/lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

export const AppPreview: React.FC<{ db: Firestore }> = ({ db }) => {
  const { previewId } = useParams();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [bypassCache, setBypassCache] = useState<boolean>(true);

  const screenId = searchParams.get("screenId");
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
          return app;
        }

        const serializedApp = localStorage.getItem(
          `ensemble-react.preview.${appId}`,
        );
        if (!serializedApp) {
          throw Error(`${appId} does not exist in cache!`);
        }
        const hydratedApp = JSON.parse(serializedApp) as ApplicationDTO;
        if (screenId) {
          const cachedScreen = localStorage.getItem(`flutter.${screenId}`);
          if (cachedScreen) {
            const matchingScreen = hydratedApp.screens.find(
              (screen) => screen.id === screenId,
            );
            if (matchingScreen) {
              set(matchingScreen, "content", JSON.parse(cachedScreen));
            }
          }
        }
        return hydratedApp;
      },
    };
    return loaderWithCache;
  }, [bypassCache, db, screenId]);

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

  if (!previewId) {
    return <Alert message="An app id must be provided" type="error" />;
  }
  return (
    <EnsembleApp
      appId={previewId}
      key={refreshCount}
      loader={loader}
      path={pathname}
      screenId={screenId ?? undefined}
    />
  );
};
