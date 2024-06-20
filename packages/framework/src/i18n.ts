import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
    // eslint-disable-next-line no-console
    console.log("i18next initialized successfully");
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Error initializing i18next:", error);
  });
