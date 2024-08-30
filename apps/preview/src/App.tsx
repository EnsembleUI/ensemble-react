import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppPreview } from "./AppPreview";
import { AppSelector } from "./AppSelector";

import "./App.css";

export const firebaseApp = initializeApp({
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
});
export const db = initializeFirestore(firebaseApp, {});

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppSelector />,
  },
  {
    path: "/preview/:previewId/*",
    element: <AppPreview db={db} />,
  },
]);
const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
