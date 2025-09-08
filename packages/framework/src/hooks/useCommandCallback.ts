import { useAtomCallback } from "jotai/utils";
import type { FC, ReactNode } from "react";
import { useCallback } from "react";
import { mapKeys } from "lodash-es";
import { createEvaluationContext } from "../evaluate";
import { appAtom, screenAtom, themeAtom, userAtom } from "../state";
import type { EnsembleContext, EnsembleLocation } from "../shared/ensemble";
import { DateFormatter } from "../date";
import type { ModalContext, NavigateFunction } from "../api";
import {
  handleConnectSocket,
  handleDisconnectSocket,
  handleMessageSocket,
  invokeAPI,
  navigateApi,
  navigateExternalScreen,
  navigateModalScreen,
  navigateUrl,
  showDialog,
  showToast,
} from "../api";
import type {
  EnsembleScreenModel,
  EnsembleWidget,
  InvokeAPIOptions,
  NavigateExternalScreen,
  NavigateModalScreenAction,
  NavigateScreenAction,
  ShowDialogAction,
  ShowToastAction,
} from "../shared";
import { deviceAtom } from "./useDeviceObserver";
import { createStorageApi, screenStorageAtom } from "./useEnsembleStorage";
import { createUserApi } from "./useEnsembleUser";
import { useCustomScope } from "./useCustomScope";
import { useLanguageScope } from "./useLanguageScope";

interface CallbackContext {
  modalContext?: ModalContext;
  render?: (widgets: EnsembleWidget[]) => ReactNode[];
  EnsembleScreen: FC<{
    inputs?: { [key: string]: unknown };
    screen: EnsembleScreenModel;
  }>;
  toaster?: (...args: unknown[]) => void;
}

export const useCommandCallback = <
  T extends unknown[] = unknown[],
  R = unknown,
>(
  command: (evalContext: EnsembleContext, ...args: T) => R,
  apis: { navigate: NavigateFunction; location?: EnsembleLocation },
  dependencies: unknown[] = [],
  callbackContext?: CallbackContext,
): ReturnType<typeof useAtomCallback<R, T>> => {
  const customScope = useCustomScope();
  const { i18n } = useLanguageScope();

  return useAtomCallback(
    useCallback(
      (get, set, ...args: T) => {
        const applicationContext = get(appAtom);
        const screenContext = get(screenAtom);
        const storage = get(screenStorageAtom);
        const device = get(deviceAtom);
        const theme = get(themeAtom);

        const storageApi = createStorageApi(storage, (next) =>
          set(screenStorageAtom, next),
        );

        const userApi = createUserApi(
          () => get(userAtom),
          (nextUser) => set(userAtom, nextUser),
        );

        const customWidgets =
          applicationContext.application?.customWidgets.reduce(
            (acc, widget) => ({ ...acc, [widget.name]: widget }),
            {},
          );

        const evalContext = createEvaluationContext({
          applicationContext,
          screenContext,
          ensemble: {
            setTheme: (name: string) => set(themeAtom, name),
            user: userApi,
            storage: storageApi,
            formatter: DateFormatter(),
            env: applicationContext.env,
            secrets: applicationContext.secrets,
            location: apis.location,
            navigateScreen: (targetScreen: NavigateScreenAction): void =>
              navigateApi(targetScreen, screenContext, apis.navigate),
            navigateUrl: (url: string, inputs?: { [key: string]: unknown }) =>
              navigateUrl(url, apis.navigate, inputs),
            navigateBack: (): void =>
              callbackContext?.modalContext
                ? callbackContext.modalContext.navigateBack()
                : apis.navigate(-1),
            invokeAPI: async (
              apiName: string,
              apiInputs?: { [key: string]: unknown },
              options?: InvokeAPIOptions,
            ) =>
              invokeAPI(
                apiName,
                screenContext,
                apiInputs,
                {
                  ...customScope,
                  ensemble: {
                    env: applicationContext.env,
                    secrets: applicationContext.secrets,
                    storage: storageApi,
                  },
                },
                undefined,
                set,
                options,
              ),
            navigateExternalScreen: (url: NavigateExternalScreen) =>
              navigateExternalScreen(url),
            openUrl: (url: NavigateExternalScreen) =>
              navigateExternalScreen(url),
            connectSocket: (name: string) =>
              handleConnectSocket(
                name,
                screenContext,
                undefined,
                undefined,
                undefined,
                set,
              ),
            messageSocket: (
              name: string,
              message: { [key: string]: unknown },
            ) => handleMessageSocket(name, message, screenContext),
            disconnectSocket: (name: string) =>
              handleDisconnectSocket(name, screenContext, set),
            setLocale: ({ languageCode }) => i18n.changeLanguage(languageCode),
            showDialog: (dialogAction?: ShowDialogAction): void =>
              showDialog({
                action: dialogAction,
                openModal: callbackContext?.modalContext?.openModal,
                render: callbackContext?.render,
              }),
            closeAllDialogs: (): void =>
              callbackContext?.modalContext?.closeAllModals(),
            navigateModalScreen: (
              navigateModalScreenAction: NavigateModalScreenAction,
            ): void => {
              if (!callbackContext?.modalContext) {
                return;
              }
              navigateModalScreen(
                navigateModalScreenAction,
                callbackContext.modalContext,
                callbackContext.EnsembleScreen,
                applicationContext.application ?? screenContext.app,
              );
            },
            showToast: (action: ShowToastAction): void =>
              showToast(action, callbackContext?.toaster),
          },
          context: {
            ...customWidgets,
            ...customScope,
            device,
            app: {
              theme,
            },
            styles: theme.Styles,
            ...mapKeys(theme.Tokens ?? {}, (_, key) => key.toLowerCase()),
          },
        });

        return command(evalContext, ...args);
      },
      [customScope, i18n, ...dependencies],
    ),
  );
};
