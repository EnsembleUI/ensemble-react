import { EnsembleApp } from "runtime";
import type { Application } from "framework";
import HomeYAML from "./ensemble/home.yaml";

import "./App.css";

const testApp: Application = {
  id: "test",
  name: "My App",
  screens: [
    {
      id: "home",
      name: "Home",
      content: String(HomeYAML),
    },
  ],
};

const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp appId="test" application={testApp} />
    </div>
  );
};

export default App;
