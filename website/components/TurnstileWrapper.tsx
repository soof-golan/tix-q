import Turnstile from "react-turnstile";

export function TurnstileWrapper(props: {
  onLoad: () => void;
  onVerify: (token: string) => void;
  onError: (error: any) => void;
}) {
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITEKEY;
  return (
    <>
      <Turnstile
        sitekey={siteKey}
        action="register"
        size="normal"
        retry="auto"
        onLoad={props.onLoad}
        onVerify={props.onVerify}
        onError={props.onError}
        onExpire={props.onLoad}
        retryInterval={1000}
        refreshExpired="auto"
        execution="render"
        onTimeout={props.onLoad}
        appearance="always"
      />
    </>
  );
}
