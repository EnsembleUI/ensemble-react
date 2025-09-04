// setup i18n to avoid react-i18next warnings during tests
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
});

// jsdom does not implement ResizeObserver; provide a polyfill for tests
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.ResizeObserver = require("resize-observer-polyfill");
