import { useMemo } from "react";

export const useWidgetId = (id?: string): string => {
  const resolvedId = useMemo<string>(() => {
    if (id) {
      return id;
    }
    return generateRandomString(6);
  }, [id]);
  return resolvedId;
};

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateRandomString = (length: number): string => {
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
