import { EnsembleApp } from "@ensembleui/react-runtime";
import { starterApp } from "./ensemble";

import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp appId="myStarterApp" application={starterApp} />
    </div>
  );
};

export default App;
