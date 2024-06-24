import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { debug, error } from "./shared";

i18n
  .use(initReactI18next)
  .init({
    lng: "en",
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    debug("i18next initialized successfully");
  })
  .catch((e) => {
    error(e);
  });
