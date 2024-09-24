import { mapKeys, merge, keys } from "lodash-es";
import type { EnsembleContext, EnsembleInterface } from "../shared/ensemble";
import type {
  ApplicationContextDefinition,
  ScreenContextDefinition,
} from "../state";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";
import { isUsingMockResponse, setUseMockResponse } from "../appConfig";
import { widgetStatesToInvokables } from "./evaluate";

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
}: EvaluationContextProps): EnsembleContext => {
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
    screenContext.widgets
      ? Object.fromEntries(widgetStatesToInvokables(screenContext.widgets))
      : {},
    screenContext.data,
  );

  const app = {
    languages: applicationContext.application?.languages,
    themes: keys(applicationContext.application?.themes),
    theme: applicationContext.selectedTheme?.name,
    useMockResponse: isUsingMockResponse(applicationContext.application?.id),
    setUseMockResponse: (value: boolean) =>
      setUseMockResponse(applicationContext.application?.id, value), //noop,
  };

  const env = applicationContext.env;

  // FIXME: this requires ensemble interface to be built outside of this function
  return merge(
    {},
    { app, ensemble, env },
    appInputs,
    screenInputs,
    context,
  ) as EnsembleContext;
};
