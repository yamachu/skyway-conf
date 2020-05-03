import React from "react";
import { useFirebaseAuth } from "./hooks/use-firebase-auth";
import { AuthContext } from "./contexts";

export const AuthProvider = (props: React.PropsWithChildren<{}>) => {
  const firebaseAuth = useFirebaseAuth();
  return (
    <AuthContext.Provider value={firebaseAuth}>
      {props.children}
    </AuthContext.Provider>
  );
};
