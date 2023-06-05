import type { PropsWithChildren } from "react";
import { AuthProvider, FirebaseAppProvider } from "reactfire";
import { app, auth } from "../utils/firebase";

export function FirebaseContext({ children }: PropsWithChildren) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>{children}</AuthProvider>
    </FirebaseAppProvider>
  );
}
