import { useEffect } from "react";
import { error, type EnsembleFontModel } from "../shared";

export const useFonts = (fonts?: EnsembleFontModel[]): void => {
  const loadFontFace = (font: EnsembleFontModel): unknown => {
    return new FontFace(font.family, `url(${font.url})`, font.options)
      .load()
      .then((loadedFont) => document.fonts.add(loadedFont))
      .catch((e) => error(e));
  };

  useEffect(() => {
    if (fonts) {
      fonts.forEach(loadFontFace);
    }
  }, [fonts]);
};
