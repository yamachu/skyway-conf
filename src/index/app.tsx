import * as React from "react";
import { FunctionComponent } from "react";
import { RoomInit } from "./utils/types";
import Layout from "./components/layout";
import RoomCreate from "./components/room-create";
import { AuthContext } from "../shared/contexts";
import { AuthGuard } from "./components/auth-guard";
import { AppMenu } from "./components/app-menu";
import { ClaimGuard } from "./components/claim-guard";

const App: FunctionComponent<{}> = () => {
  const { user } = React.useContext(AuthContext);
  const onSubmit = React.useCallback(
    (room: RoomInit) => {
      if (user === null) {
        return;
      }

      user
        .getIdToken()
        .then((token) =>
          fetch("http://localhost:8080/rooms", {
            method: "POST",
            body: JSON.stringify(room),
            headers: new Headers([
              ["Authorization", `Bearer ${token}`],
              ["Content-Type", "application/json"],
            ]),
            mode: "cors",
          }).then((v) => {
            if (!v.ok) {
              throw new Error();
            }
          })
        )
        .then(() => {
          location.href = "conf.html";
        });
    },
    [user]
  );
  const expectClaimEff = React.useCallback(
    (claims: { [_: string]: unknown }) => claims.interviewer === true,
    []
  );

  return (
    <>
      <AppMenu />
      <Layout>
        <AuthGuard>
          <ClaimGuard
            user={user}
            expect={expectClaimEff}
            fallback={
              <div>
                Jump <a href={"conf.html"}>chan room</a>
              </div>
            }
          >
            <RoomCreate onSubmit={onSubmit} />
          </ClaimGuard>
        </AuthGuard>
      </Layout>
    </>
  );
};

export default App;
