import { useTranslation } from "react-i18next";

export interface CustomLocaleScope {
  [key: string]: unknown;
}
export const useLocaleScope = () => {
  return useTranslation();
};
