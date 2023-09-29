import { EnsembleApp } from "runtime";
import type { ApplicationDTO } from "framework";
import HomeYAML from "./ensemble/home.yaml";
import CollectionsYAML from "./ensemble/collections.yaml";
import UsersAndGroupsYAML from "./ensemble/usersAndGroups.yaml";
import DashboardYAML from "./ensemble/dashboard.yaml";
import AskEmbraceYAML from "./ensemble/askEmbrace.yaml";

import "./App.css";

const testApp: ApplicationDTO = {
  id: "test",
  name: "My App",
  screens: [
    {
      id: "home",
      name: "Home",
      content: String(HomeYAML),
    },
    {
      id: "collections",
      name: "Collections",
      content: String(CollectionsYAML),
    },
    {
      id: "usersAndGroups",
      name: "UsersAndGroups",
      content: String(UsersAndGroupsYAML),
    },
    {
      id: "dashboard",
      name: "Dashboard",
      content: String(DashboardYAML),
    },
    {
      id: "askEmbrace",
      name: "Ask Embrace",
      content: String(AskEmbraceYAML),
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
