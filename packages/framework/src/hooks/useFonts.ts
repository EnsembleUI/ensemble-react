import { useEffect } from "react";
import { error, type EnsembleFontModel } from "../shared";

export const useFonts = (fonts: EnsembleFontModel[]): void => {
  useEffect(() => {
    const fontFaces = fonts.map((font) => {
      return new FontFace(font.family, `url(${font.url})`, {});
    });

    const loadFontFaces = () => {
      for (const fontFace of fontFaces) {
        try {
          const loadedFont = fontFace.load();
          document.fonts.add(loadedFont);
        } catch (e) {
          error(e);
        }
      }
    };

    loadFontFaces();
  }, [fonts]);
};
