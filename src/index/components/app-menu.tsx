import { css } from "@emotion/core";
import firebase from "firebase";
import React from "react";
import { AuthContext } from "../../shared/contexts";

export const AppMenu: React.FunctionComponent<{}> = () => {
  const auth = React.useContext(AuthContext);

  return (
    <header css={appBarStyle}>
      {auth.user === null ? (
        <LoginForm
          signInWithEmailAndPassword={auth.signInWithEmailAndPassword}
        />
      ) : (
        <UserView user={auth.user} />
      )}
    </header>
  );
};

const LoginForm: React.FunctionComponent<{
  signInWithEmailAndPassword: (email: string, password: string) => void;
}> = ({ signInWithEmailAndPassword }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signInWithEmailAndPassword(email, password);
      }}
    >
      <label style={{ padding: "0 8px" }}>
        Email:
        <input
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
      </label>
      <label style={{ padding: "0 8px" }}>
        Password:
        <input
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
      </label>
      <input type="submit" value="Submit" style={{ margin: "0 8px" }} />
    </form>
  );
};

const UserView: React.FunctionComponent<{ user: firebase.User }> = ({
  user,
}) => <div>{`Uid: ${user.uid}`}</div>;

const appBarStyle = css({
  display: "flex",
  width: "100%",
  position: "sticky",
  height: "48px",
  justifyContent: "flex-end",
  alignItems: "center",
});
