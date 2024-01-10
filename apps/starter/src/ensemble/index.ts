import { type ApplicationDTO } from "@ensembleui/react-framework";
// Screens
import MenuYAML from "./screens/menu.yaml";
import HomeYAML from "./screens/home.yaml";
import HelpYAML from "./screens/help.yaml";
import ChartsYAML from "./screens/charts.yaml";
// Widgets
import HeaderWidgetYAML from "./widgets/Header.yaml";
// Scripts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import HelloScriptJs from "./scripts/hello.js?raw";
// Config
import ConfigYAML from "./config.yaml";
// Theme
import ThemeYAML from "./theme.yaml";

// Construct our app programmatically. This can also be served remotely or
// even generated server side.
export const starterApp: ApplicationDTO = {
  id: "myStarterApp",
  name: "My App",
  theme: {
    id: "theme",
    content: String(ThemeYAML),
  },
  config: ConfigYAML,
  scripts: [
    {
      id: "hello",
      name: "hello.js",
      content: String(HelloScriptJs),
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
      id: "help",
      name: "Help",
      content: String(HelpYAML),
    },
    {
      id: "charts",
      name: "Charts",
      content: String(ChartsYAML),
    },
  ],
};
