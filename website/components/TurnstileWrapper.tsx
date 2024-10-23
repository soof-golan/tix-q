import Turnstile from "react-turnstile";
import { useTurnstile } from "./TurnstileContext";

export function TurnstileWrapper() {
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITEKEY;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_token, setToken] = useTurnstile();
  return (
    <>
      <Turnstile
        sitekey={siteKey}
        action="register"
        size="normal"
        retry="auto"
        onLoad={() => setToken("")}
        onVerify={(v) => setToken(v)}
        onError={() => setToken("")}
        onExpire={() => setToken("")}
        retryInterval={1000}
        refreshExpired="auto"
        execution="render"
        onTimeout={() => setToken("")}
        appearance="always"
      />
    </>
  );
}
