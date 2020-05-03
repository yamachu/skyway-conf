import * as React from "react";
import { render } from "react-dom";
import { Global } from "@emotion/core";
import debug from "debug";
import { name, version } from "../../package.json";
import { globalStyle } from "../shared/global-style";
import App from "./app";
import firebase from "firebase";
import firebaseConfig from "../../credentials/firebase-client.json";
import { AuthProvider } from "../shared/auth-provider";

const log = debug("main");

firebase.initializeApp(firebaseConfig);

(async () => {
  log(`${name} v${version}`);
  document.title += ` v${version}`;

  render(
    <React.StrictMode>
      <Global styles={globalStyle} />
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
    document.getElementById("app-root")
  );
})().catch((err) => console.error(err));
