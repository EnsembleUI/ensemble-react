// setup i18n to avoid react-i18next warnings during tests
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
});

// jsdom does not implement ResizeObserver; provide a minimal polyfill for tests
class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

// assign polyfill to the global scope used by jsdom
(
  globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
).ResizeObserver = ResizeObserver;
