import React from "react";
import firebase from "firebase";

export type AuthContextValue = {
  user: firebase.User | null;
  signInWithEmailAndPassword: (email: string, password: string) => void;
};

export const AuthContext = React.createContext<AuthContextValue>(
  (undefined as unknown) as AuthContextValue
);
