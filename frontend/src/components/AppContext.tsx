import type { PropsWithChildren } from "react";
import TrpcContext from "./TrpcContext";
import { FirebaseContext } from "./FirebaseContext";
export default function AppContext({ children }: PropsWithChildren) {
  return (
    <FirebaseContext>
      <TrpcContext>{children}</TrpcContext>
    </FirebaseContext>
  );
}
