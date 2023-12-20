import { useMemo } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { WidgetRegistry } from "../registry";

export type SignInWithGoogleProps = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "small" | "medium";
  text?: "signin_with" | "signup_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
};

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = (props) => {
  const handleSuccessfullGoogleLoginResponse = (credentialResponse: any) => {
    const userDetails = jwtDecode(credentialResponse.credential);
  };

  // google login component
  const SignInWithGoogleComponent = useMemo(() => {
    return (
      <GoogleLogin
        type={props.type}
        theme={props.theme}
        size={props.size}
        text={props.text}
        shape={props.shape}
        onSuccess={handleSuccessfullGoogleLoginResponse}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    );
  }, []);

  return SignInWithGoogleComponent;
};

WidgetRegistry.register("SignInWithGoogle", SignInWithGoogle);
