import type {
  ScreenContextDefinition,
  NavigateScreenAction,
  NavigateExternalScreen,
  NavigateModalScreenAction,
  EnsembleAppModel,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { cloneDeep, isObject, isString, merge } from "lodash-es";
import type { NavigateFunction } from "react-router-dom";
import type { ModalContextProps } from "./modal";
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "./screen";

const findScreen = (
  screenName: string,
  app?: EnsembleAppModel,
): EnsembleScreenModel | undefined => {
  return app?.screens.find(
    (s) => s.name.toLowerCase() === screenName.toLowerCase(),
  );
};

export const navigateApi = (
  action: NavigateScreenAction,
  screenContext: ScreenContextDefinition,
  navigate: NavigateFunction,
): void => {
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action.name : action;

  // find the matching screen
  const matchingScreen = findScreen(screenName, screenContext.app);

  if (!matchingScreen) {
    return;
  }

  // set additional inputs
  const inputs =
    !isString(action) && action.inputs ? cloneDeep(action.inputs) : {};

  navigate(`/${matchingScreen.name.toLowerCase()}`, { state: inputs });
};

const MODAL_SCREEN_DEFAULT_OPTIONS = {
  maskClosable: true,
  hideCloseIcon: true,
  hideFullScreenIcon: true,
  padding: "12px",
};
export const navigateModalScreen = (
  action: NavigateModalScreenAction,
  screenContext: ScreenContextDefinition,
  modalContext: ModalContextProps,
  inputs?: { [key: string]: unknown },
  title?: React.ReactNode[],
): void => {
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action.name : action;

  const matchingScreen = findScreen(screenName, screenContext.app);

  if (!matchingScreen) {
    return;
  }
  const modalOptions = { ...MODAL_SCREEN_DEFAULT_OPTIONS };
  if (isObject(action)) {
    merge(
      modalOptions,
      action,
      { ...action.styles },
      { title: title ?? action.title },
    );
  }

  modalContext.openModal(
    <EnsembleScreen inputs={inputs} screen={matchingScreen} />,
    modalOptions,
  );
};

export const navigateUrl = (
  url: string,
  navigate: NavigateFunction,
  inputs?: { [key: string]: unknown },
): void => {
  // set additional inputs
  const urlInputs = inputs && isObject(inputs) ? cloneDeep(inputs) : {};

  navigate(url, { state: urlInputs });
};

export const openExternalScreen = (action: NavigateExternalScreen): void => {
  const hasOptions = !isString(action);
  const screenUrl = hasOptions ? action.url : action;

  if (!screenUrl) {
    return;
  }

  window.open(
    screenUrl,
    !isString(action) && !(action.external || action.openNewTab) ? "_self" : "",
  );
};

export const navigateExternalScreen = (
  action: NavigateExternalScreen,
): void => {
  openExternalScreen(action);
};
