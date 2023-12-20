import { useCallback, useMemo } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useEnsembleUser } from "@ensembleui/react-framework";
import type { EnsembleAction } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export type SignInWithGoogleProps = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "small" | "medium";
  text?: "signin_with" | "signup_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  onSignedIn?: EnsembleAction;
  onError?: EnsembleAction;
};

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = (props) => {
  const { values, rootRef } = useRegisterBindings(props);

  const [user, setUser] = useEnsembleUser();
  const onSignInAction = useEnsembleAction(props.onSignedIn);
  const onErrorAction = useEnsembleAction(props.onError);

  // trigger on signin action
  const onSignInActionCallback = useCallback(
    (values: unknown) => {
      if (!onSignInAction) {
        return;
      }

      return onSignInAction.callback({ values });
    },
    [onSignInAction]
  );

  // trigger on error action
  const onErrorActionCallback = useCallback(() => {
    if (!onErrorAction) {
      return;
    }

    return onErrorAction.callback();
  }, [onErrorAction]);

  // handle google login resposne
  const handleSuccessfullGoogleLoginResponse = (credentialResponse: any) => {
    const userDetails = jwtDecode(credentialResponse.credential);
    setUser({ ...user, ...userDetails });

    // trigger the on sign in action
    onSignInActionCallback(userDetails);
  };

  // google login component
  const SignInWithGoogleComponent = useMemo(() => {
    return (
      <GoogleLogin
        type={values?.type}
        theme={values?.theme}
        size={values?.size}
        text={values?.text}
        shape={values?.shape}
        onSuccess={handleSuccessfullGoogleLoginResponse}
        onError={onErrorActionCallback}
      />
    );
  }, []);

  return SignInWithGoogleComponent;
};

WidgetRegistry.register("SignInWithGoogle", SignInWithGoogle);
