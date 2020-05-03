import firebase from "firebase";
import React from "react";

export const useFirebaseAuth = () => {
  const [user, setUser] = React.useState<firebase.User | null>(null);

  const signInWithEmailAndPassword = React.useCallback(
    (email, password) =>
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((v) => setUser(v.user))
        .catch((e) => console.error(e)),
    []
  );

  React.useEffect(() => {
    const disposable = firebase.auth().onIdTokenChanged(
      (maybeUser) => setUser(maybeUser),
      (e) => {
        console.warn(`Firebase Auth State Changed fired error: ${e}`);
      }
    );

    return () => disposable();
  }, []);

  const state = React.useMemo(() => ({ user, signInWithEmailAndPassword }), [
    user,
    signInWithEmailAndPassword,
  ]);

  return state;
};
