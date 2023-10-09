import { EnsembleApp } from "runtime";
import type { ApplicationDTO } from "framework";
import HomeYAML from "./ensemble/home.yaml";
import CollectionsYAML from "./ensemble/collections.yaml";
import UsersAndGroupsYAML from "./ensemble/usersAndGroups.yaml";
import DashboardYAML from "./ensemble/dashboard.yaml";
import AskEmbraceYAML from "./ensemble/askEmbrace.yaml";
import CreateGroupYAML from "./ensemble/createGroup.yaml";
import InviteYAML from "./ensemble/invite.yaml";
import ProductAndDevelopment from "./ensemble/productAndDevelopment.yaml";

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
    {
      id: "createGroup",
      name: "Create Group",
      content: String(CreateGroupYAML),
    },
    {
      id: "invite",
      name: "Invite",
      content: String(InviteYAML),
    },
    {
      id: "productAndDevelopment",
      name: "Product and Development",
      content: String(ProductAndDevelopment),
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
