import { cloneDeep, isObject, isString, merge, omit } from "lodash-es";
import type { FC } from "react";
import type {
  EnsembleAppModel,
  EnsembleScreenModel,
  NavigateScreenAction,
  NavigateModalScreenAction,
  NavigateExternalScreen,
} from "../shared";
import type { ScreenContextDefinition } from "../state";
import type { ModalContext } from "./modal";

export interface NavigateFunction {
  (to: string, options?: { state: { [key: string]: unknown } }): void;
  (delta: number): void;
}

const findScreen = (
  screenName: string,
  app?: EnsembleAppModel | null,
): EnsembleScreenModel | undefined => {
  return app?.screens.find(
    (s) => s.name?.toLowerCase() === screenName.toLowerCase(),
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

  if (!matchingScreen?.name) {
    return;
  }

  // set additional inputs
  const inputs =
    !isString(action) && action.inputs ? cloneDeep(action.inputs) : {};

  navigate(`/${matchingScreen.name.toLowerCase()}`, {
    state: inputs,
  });
};

const MODAL_SCREEN_DEFAULT_OPTIONS = {
  maskClosable: true,
  hideCloseIcon: true,
  hideFullScreenIcon: true,
  padding: "12px",
};

export const navigateModalScreen = (
  action: NavigateModalScreenAction,
  modalContext: ModalContext,
  EnsembleScreen: FC<{
    inputs?: { [key: string]: unknown };
    screen: EnsembleScreenModel;
  }>,
  app?: EnsembleAppModel | null,
  inputs?: { [key: string]: unknown },
  title?: React.ReactNode[],
  onClose?: () => void,
): void => {
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action.name : action;

  const matchingScreen = findScreen(screenName, app);

  if (!matchingScreen) {
    return;
  }
  const modalOptions = { ...MODAL_SCREEN_DEFAULT_OPTIONS, onClose };
  if (isObject(action)) {
    merge(
      modalOptions,
      omit(action, "inputs"),
      { ...action.styles },
      { title: title ?? action.title },
    );
  }

  modalContext.openModal(
    <EnsembleScreen
      inputs={inputs ?? (hasOptions ? action.inputs : {})}
      screen={matchingScreen}
    />,
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
