import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";
import { EnsembleApp } from "@ensembleui/react-runtime";
import { getFirestoreApplicationLoader } from "@ensembleui/react-framework";

import "./App.css";

const firebaseApp = initializeApp({
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
});
const db = initializeFirestore(firebaseApp, {});
const firestoreLoader = getFirestoreApplicationLoader(db);

interface EnsembleConfig {
  appId?: string;
}

const App: React.FC = () => {
  const [appId, setAppId] = useState<string>();
  useEffect(() => {
    const getEnsembleConfig = async (): Promise<void> => {
      const response = await fetch("/ensemble.config.json");
      const config = (await response.json()) as EnsembleConfig;
      if (config.appId) {
        setAppId(config.appId);
      } else {
        throw Error("Please set your appId in your ensemble.config.json file");
      }
    };
    void getEnsembleConfig();
  }, []);

  if (!appId) {
    return null;
  }

  return (
    <div className="App">
      <EnsembleApp appId={appId} loader={firestoreLoader} />
    </div>
  );
};

export default App;
