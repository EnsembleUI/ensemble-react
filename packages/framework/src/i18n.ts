import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { debug, error } from "./shared";

export const languageMap: { [key: string]: string } = {
  ar: "Arabic",
  bn: "Bengali",
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  hi: "Hindi",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  jv: "Javanese",
  ko: "Korean",
  ms: "Malay",
  nl: "Dutch",
  pa: "Punjabi",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sv: "Swedish",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  zh: "Chinese",
  el: "Greek",
  da: "Danish",
};

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: "en",
    debug: process.env.NODE_ENV === "development",
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
