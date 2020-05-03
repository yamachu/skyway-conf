import React from "react";
import { AuthContext } from "../../shared/contexts";

export const AuthGuard = (props: React.PropsWithChildren<{}>) => {
  const auth = React.useContext(AuthContext);
  if (auth.user === null) {
    return null;
  }

  return <>{props.children}</>;
};
