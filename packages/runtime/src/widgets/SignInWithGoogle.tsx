import { useEffect, useMemo, useState } from "react";
import type { Expression } from "@ensembleui/react-framework";
import {
  useRegisterBindings,
  EnsembleWidget,
  unwrapWidget,
} from "@ensembleui/react-framework";
import { GoogleLogin } from "@react-oauth/google";
import { WidgetRegistry } from "../registry";
import { cloneDeep } from "lodash-es";

export type SignInWithGoogleProps = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "small" | "medium";
  text?: "signin_with" | "signup_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
};

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = (props) => {
  const { values, rootRef } = useRegisterBindings(props);

  // google login component
  const SignInWithGoogleComponent = useMemo(() => {
    return (
      <GoogleLogin
        type={props.type}
        theme={props.theme}
        size={props.size}
        text={props.text}
        shape={props.shape}
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    );
  }, []);

  return SignInWithGoogleComponent;
};

WidgetRegistry.register("SignInWithGoogle", SignInWithGoogle);
