import React from "react";
import type { User } from "firebase";

export const ClaimGuard = (
  props: React.PropsWithChildren<{
    user: User | null;
    expect: (claims: { [_: string]: unknown }) => boolean;
    fallback: JSX.Element;
  }>
) => {
  const { user, expect, fallback } = props;
  const [guardState, setGuardState] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (user === null) {
      setGuardState(null);
      return;
    }
    user.getIdTokenResult().then((v) => setGuardState(expect(v.claims)));
  }, [user, expect]);

  if (guardState === null) {
    return null;
  }

  if (!guardState) {
    return fallback;
  }

  return <>{props.children}</>;
};
