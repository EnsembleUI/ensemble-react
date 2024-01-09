import { EnsembleApp } from "@ensembleui/react-runtime";
import type { ApplicationDTO } from "@ensembleui/react-framework";
// Screens
import MenuYAML from "./ensemble/screens/menu.yaml";
import HomeYAML from "./ensemble/screens/home.yaml";
import WidgetsYAML from "./ensemble/screens/widgets.yaml";
import LayoutsYAML from "./ensemble/screens/layouts.yaml";
import ActionsYAML from "./ensemble/screens/actions.yaml";
import CustomWidgetsYAML from "./ensemble/screens/customWidgets.yaml";
import HelpYAML from "./ensemble/screens/help.yaml";
// Widgets
import HeaderWidgetYAML from "./ensemble/widgets/Header.yaml";
// Scripts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import FirstScript from "./ensemble/scripts/test.js?raw";
// ensemble-config
import EnsembleConfig from "./ensemble/config.yaml";
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
  scripts: [
    {
      id: "test",
      name: "test.js",
      content: String(FirstScript),
    },
  ],
  widgets: [
    {
      id: "Header",
      name: "Header",
      content: String(HeaderWidgetYAML),
    },
  ],
  screens: [
    {
      id: "menu",
      name: "Menu",
      content: String(MenuYAML),
    },
    {
      id: "home",
      name: "Home",
      content: String(HomeYAML),
    },
    {
      id: "widgets",
      name: "Widgets",
      content: String(WidgetsYAML),
    },
    {
      id: "layouts",
      name: "Layouts",
      content: String(LayoutsYAML),
    },
    {
      id: "actions",
      name: "Actions",
      content: String(ActionsYAML),
    },
    {
      id: "customWidgets",
      name: "Custom Widgets",
      content: String(CustomWidgetsYAML),
    },
    {
      id: "help",
      name: "Help",
      content: String(HelpYAML),
    },
  ],
  config: EnsembleConfig,
};

const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp appId="test" application={testApp} key="test" />
    </div>
  );
};

export default App;
