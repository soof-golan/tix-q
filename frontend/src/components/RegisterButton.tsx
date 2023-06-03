import TrpcContext from "./TrpcContext";
import {trpc} from "../utils/trpc";
import Turnstile from "react-turnstile";
import {useCookie, useSessionStorage} from "react-use";

function RegisterButton_() {
  const [token, setToken] = useCookie("turnstile_token");
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITEKEY;
  const register = trpc.register.useMutation({});

  return <>
    <button
      onClick={() => register.mutate({
        idType: "PASSPORT",
        email: "test@email.com",
        idNumber: "1234567890",
        legalName: "Test User",
        phoneNumber: "+1234567890",
        waitingRoomId: "aa7604ed-6d0d-4785-9689-4a0d09682565",
      })} disabled={register.isLoading || !token}>Register
    </button>

    <Turnstile
      sitekey={siteKey}
      action="register"
      size="normal"
      retry="auto"
      onLoad={() => {
        setToken("")
      }}
      onVerify={(token) => {
        setToken(token, {
          secure: import.meta.env.PROD,
          sameSite: "strict",
        });
      }}
      onError={(error) => {
        setToken("")
      }}
      onExpire={() => {
        setToken("")
      }}
      retryInterval={1000}
      refreshExpired="auto"
      execution="render"
      onTimeout={() => {
        setToken("")
      }}
      appearance="always"

    />
  </>
}

export default function RegisterButton() {
  return <TrpcContext>
    <RegisterButton_/>
  </TrpcContext>;

}
