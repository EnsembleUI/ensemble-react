import { useCallback, useMemo, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {
  useRegisterBindings,
  useEnsembleUser,
} from "@ensembleui/react-framework";
import type { EnsembleAction } from "@ensembleui/react-framework";
import { Alert } from "antd";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

const widgetName = "SignInWithGoogle";

export interface SignInWithGoogleProps {
  clientId: string;
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "small" | "medium";
  text?: "signin_with" | "signup_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  onSignedIn?: EnsembleAction;
  onError?: EnsembleAction;
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = (props) => {
  const [clientId, setClientId] = useState(props.clientId);
  const { values } = useRegisterBindings(
    { ...props, clientId, widgetName },
    undefined,
    {
      setClientId,
    },
  );
  const user = useEnsembleUser();
  const onSignInAction = useEnsembleAction(props.onSignedIn);
  const onErrorAction = useEnsembleAction(props.onError);

  // trigger on signin action
  const onSignInActionCallback = useCallback(
    (data: unknown) => {
      if (!onSignInAction) {
        return;
      }

      return onSignInAction.callback({ data });
    },
    [onSignInAction],
  );

  // trigger on error action
  const onErrorActionCallback = useCallback(() => {
    if (!onErrorAction) {
      return;
    }

    return onErrorAction.callback();
  }, [onErrorAction]);

  // handle google login resposne
  const handleSuccessfullGoogleLoginResponse = (
    credentialResponse: CredentialResponse,
  ): void => {
    if (!credentialResponse?.credential) {
      return;
    }

    const userDetails = jwtDecode(credentialResponse.credential);
    user.set(userDetails as Record<string, unknown>);

    // trigger the on sign in action
    onSignInActionCallback(userDetails);
  };

  // google login component
  const SignInWithGoogleComponent = useMemo(() => {
    return (
      <>
        {values?.clientId ? (
          <GoogleOAuthProvider clientId={values.clientId}>
            <GoogleLogin
              type={values?.type}
              theme={values?.theme}
              size={values?.size}
              text={values?.text}
              shape={values?.shape}
              onSuccess={handleSuccessfullGoogleLoginResponse}
              onError={onErrorActionCallback}
            />
          </GoogleOAuthProvider>
        ) : (
          <Alert message="Cliient id is missing" type="error" />
        )}
      </>
    );
  }, [values]);

  return SignInWithGoogleComponent;
};

WidgetRegistry.register(widgetName, SignInWithGoogle);
