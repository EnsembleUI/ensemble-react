import { EnsembleApp } from "@ensembleui/react-runtime";
import type { ApplicationDTO } from "@ensembleui/react-framework";
// Screens
import HomeYAML from "./ensemble/screens/home.yaml";
import CollectionsYAML from "./ensemble/screens/collections.yaml";
import UsersAndGroupsYAML from "./ensemble/screens/usersAndGroups.yaml";
import DashboardYAML from "./ensemble/screens/dashboard.yaml";
import AskEmbraceYAML from "./ensemble/screens/askEmbrace.yaml";
import CreateGroupYAML from "./ensemble/screens/createGroup.yaml";
import InviteYAML from "./ensemble/screens/invite.yaml";
import ProductAndDevelopmentYAML from "./ensemble/screens/productAndDevelopment.yaml";
import CreateCollectionYAML from "./ensemble/screens/createCollection.yaml";
import AddGroupsYAML from "./ensemble/screens/addGroups.yaml";
// Widgets
import HeaderWidgetYAML from "./ensemble/widgets/Header.yaml";
// Theme
import ThemeYAML from "./ensemble/theme.yaml";

import "./App.css";

const testApp: ApplicationDTO = {
  id: "test",
  name: "My App",
  theme: {
    id: "theme",
    content: String(ThemeYAML),
  },
  widgets: [
    {
      id: "Header",
      name: "Header",
      content: String(HeaderWidgetYAML),
    },
  ],
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
      content: String(ProductAndDevelopmentYAML),
    },
    {
      id: "createCollection",
      name: "Create Collection",
      content: String(CreateCollectionYAML),
    },
    {
      id: "addGroups",
      name: "Add Groups",
      content: String(AddGroupsYAML),
    },
  ],
};

const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp appId="test" application={testApp} key="test" />
    </div>
  );
};

export default App;
