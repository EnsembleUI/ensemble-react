import { getFirestoreApplicationLoader } from "@ensembleui/react-framework";
import { EnsembleApp } from "@ensembleui/react-runtime";
import { Alert } from "antd";
import type { Firestore } from "firebase/firestore/lite";
import { useLocation, useParams } from "react-router-dom";

export const AppPreview: React.FC<{ db: Firestore }> = ({ db }) => {
  const { previewId } = useParams();
  const { pathname } = useLocation();
  if (!previewId) {
    return <Alert message="An app id must be provided" type="error" />;
  }
  return (
    <EnsembleApp
      appId={previewId}
      loader={getFirestoreApplicationLoader(db)}
      path={pathname}
    />
  );
};
