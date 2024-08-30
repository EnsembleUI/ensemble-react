import { useEffect } from "react";
import { error, type EnsembleFontModel } from "../shared";

export const useFonts = (fonts: EnsembleFontModel[]): void => {
  useEffect(() => {
    const fontFaces = fonts.map((font) => {
      return new FontFace(font.family, `url(${font.url})`, font.options);
    });

    const loadFontFaces = (): void => {
      fontFaces.map(async (fontFace) => {
        await fontFace
          .load()
          .then((loadedFont) => {
            document.fonts.add(loadedFont);
          })
          .catch((e) => {
            error(e);
          });
      });
    };

    loadFontFaces();
  }, [fonts]);
};
