import { useTranslation } from "react-i18next";

export interface CustomLanguageScope {
  [key: string]: unknown;
}
export const useLanguageScope = () => {
  return useTranslation();
};
