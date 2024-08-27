import { mapKeys, merge, keys } from "lodash-es";
import type { EnsembleInterface } from "../shared/ensemble";
import type {
  ApplicationContextDefinition,
  ScreenContextDefinition,
} from "../state";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";

export interface EvaluationContextProps {
  applicationContext: Omit<
    Partial<ApplicationContextDefinition>,
    "application"
  > & {
    application?: Partial<EnsembleAppModel> | null;
    selectedTheme?: EnsembleThemeModel;
  };
  screenContext: Partial<ScreenContextDefinition>;
  ensemble: Partial<EnsembleInterface>;
  context?: { [key: string]: unknown };
  app?: { [key: string]: unknown };
}

export const createEvaluationContext = ({
  applicationContext,
  screenContext,
  ensemble,
  context,
}: EvaluationContextProps): { [key: string]: unknown } => {
  const theme = applicationContext.selectedTheme;
  const appInputs = merge(
    {},
    applicationContext.env,
    applicationContext.secrets,
    mapKeys(theme?.Tokens ?? {}, (_, key) => key.toLowerCase()),
    { styles: theme?.Styles },
  );

  const screenInputs = merge(
    {},
    screenContext.inputs,
    screenContext.widgets,
    screenContext.data,
  );

  const app = {
    languages: applicationContext.application?.languages,
    themes: keys(applicationContext.application?.themes),
    theme: applicationContext.selectedTheme?.name,
  };

  const env = applicationContext.env;

  return merge({}, { app, ensemble, env }, appInputs, screenInputs, context);
};
