import type { ApplicationDTO } from "@ensembleui/react-framework";
import { EnsembleApp } from "@ensembleui/react-runtime";
// Screens
import MenuYAML from "./ensemble/screens/menu.yaml";
import HomeYAML from "./ensemble/screens/home.yaml";
import WidgetsYAML from "./ensemble/screens/widgets.yaml";
import LayoutsYAML from "./ensemble/screens/layouts.yaml";
import ActionsYAML from "./ensemble/screens/actions.yaml";
import FormsYAML from "./ensemble/screens/forms.yaml";
import CustomWidgetsYAML from "./ensemble/screens/customWidgets.yaml";
import HelpYAML from "./ensemble/screens/help.yaml";
import ProductYAML from "./ensemble/screens/product.yaml";
// Widgets
import HeaderWidgetYAML from "./ensemble/widgets/Header.yaml";
import StyledTextWidgetYAML from "./ensemble/widgets/StyledText.yaml";
import DispatchButtonWidgetYAML from "./ensemble/widgets/Button.yaml";
// Scripts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import FirstScript from "./ensemble/scripts/test.js?raw";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import CommonScript from "./ensemble/scripts/common.js?raw";
// ensemble-config
import EnsembleConfig from "./ensemble/config.yaml";
// Theme
import ThemeYAML from "./ensemble/theme.yaml";
import DarkThemeYAML from "./ensemble/dark.yaml";
// Locals
import EnLocale from "./ensemble/locales/en.yaml";
import HiLocale from "./ensemble/locales/hi.yaml";

import "./App.css";

const testApp: ApplicationDTO = {
  id: "test",
  name: "My App",
  themes: [
    {
      id: "theme",
      name: "default",
      content: String(ThemeYAML),
    },
    {
      id: "darkTheme",
      name: "dark",
      content: String(DarkThemeYAML),
    },
  ],
  languages: [
    {
      name: "English",
      nativeName: "English",
      languageCode: "en",
      content: String(EnLocale),
    },
    {
      name: "Hindi",
      nativeName: "हिंदी",
      languageCode: "hi",
      content: String(HiLocale),
    },
  ],
  scripts: [
    {
      id: "test",
      name: "test.js",
      content: String(FirstScript),
    },
    {
      id: "common",
      name: "common",
      content: String(CommonScript),
    },
  ],
  widgets: [
    {
      id: "Header",
      name: "Header",
      content: String(HeaderWidgetYAML),
    },
    {
      id: "StyledText",
      name: "StyledText",
      content: String(StyledTextWidgetYAML),
    },
    {
      id: "DispatchButton",
      name: "DispatchButton",
      content: String(DispatchButtonWidgetYAML),
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
      id: "forms",
      name: "Forms",
      content: String(FormsYAML),
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
    {
      id: "help",
      name: "Help",
      content: String(HelpYAML),
    },
    {
      id: "product",
      name: "Product",
      path: "/product/:product_name",
      content: String(ProductYAML),
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
