import { EnsembleApp } from "@ensembleui/react-runtime";
// import { starterApp } from "./ensemble";

import "./App.css";

import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";
import { getFirestoreApplicationLoader } from "@ensembleui/react-framework";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyC3E_Y3y6ufwLNRe32PqmlFRXsiYEZ2-I4",
  authDomain: "ensemble-web-studio-dev.firebaseapp.com",
  projectId: "ensemble-web-studio-dev",
  storageBucket: "ensemble-web-studio-dev.appspot.com",
  messagingSenderId: "126811761383",
  appId: "1:126811761383:web:582bde07712c82bec7d042",
  measurementId: "G-95XC4X2T4S",
});
export const db = initializeFirestore(firebaseApp, {});

const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp
        appId="0DTXU6S5DzMwTvLAjAeW"
        loader={getFirestoreApplicationLoader(db)}
      />
    </div>
  );
};

export default App;
