import * as React from "react";
import { useContext, useEffect } from "react";
import { FunctionComponent, ReactNode } from "react";
import { Observer } from "mobx-react";
import { css } from "@emotion/core";
import { StoreContext } from "../contexts";
import {
  checkRoomSetting,
  ensureAudioDevice,
  listenGlobalEvents,
  loadClient
} from "../effects/bootstrap";
import ErrorDetail from "../components/error-detail";

interface Props {
  children: ReactNode;
}
const Bootstrap: FunctionComponent<Props> = ({ children }) => {
  const store = useContext(StoreContext);

  useEffect(checkRoomSetting(store), [store]);
  useEffect(ensureAudioDevice(store), [store]);
  useEffect(listenGlobalEvents(), [store]);
  useEffect(loadClient(store), [store]);

  const { ui, client, media } = store;
  return (
    <div css={wrapperStyle}>
      <Observer>
        {() => {
          if (ui.error instanceof Error) {
            return <ErrorDetail error={ui.error} />;
          }

          if (!(client.isReady && media.isReady)) {
            return (
              <img css={loaderStyle} src="./images/conf/icon-loading.svg" />
            );
          }

          return <>{children}</>;
        }}
      </Observer>
    </div>
  );
};

export default Bootstrap;

const wrapperStyle = css({
  height: "100vh",
  position: "relative"
});

const loaderStyle = css({
  position: "absolute",
  margin: "auto",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
});