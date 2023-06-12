import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  checkActionCode,
  type AuthError,
} from "firebase/auth";
import { useSigninCheck } from "reactfire";
import { useEffect, useRef, useState } from "react";
import { AuthErrorCodes } from "firebase/auth";
import { auth } from "../utils/firebase";

export { Page };

type AuthProps = {
  children?: never;
  redirectUrl?: string;
};

function Page({ redirectUrl }: AuthProps) {
  const signinCheck = useSigninCheck();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const redirectUrl = window.localStorage.getItem("redirectUrl") ?? "/";
    const link = window.location.href;

    if (!isSignInWithEmailLink(auth, link)) {
      setLoading(false);
      return;
    }
    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      setLoading(false);
      return;
    }
    const oobCode = new URL(link).searchParams.get("oobCode")!;
    checkActionCode(auth, oobCode!)
      .catch((error) => {
        const alreadyUsed =
          error?.code === AuthErrorCodes.INVALID_OOB_CODE ||
          error?.code === AuthErrorCodes.EXPIRED_OOB_CODE;
        if (alreadyUsed) {
          // Do nothing
        } else {
          throw error;
        }
      })
      .then(async () => {
        try {
          const result = await signInWithEmailLink(auth, email, link);
          window.localStorage.removeItem("emailForSignIn");
          window.location.replace(redirectUrl);
        } catch (error: unknown) {
          console.error(
            (error as AuthError)?.message ?? "An unknown error occurred"
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || signinCheck.status === "loading")
    return (
      <>
        <p>Loading...</p>
      </>
    );
  if (signinCheck.data?.signedIn) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-2">
        <div className="flex flex-col space-y-4 rounded-lg bg-white bg-opacity-80 p-4 shadow backdrop-blur-sm">
          <p>You are signed in as {signinCheck.data.user.email}</p>
          <a href="/dashboard">
            <button className="w-full rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-700">
              Go to dashboard
            </button>
          </a>
          <button
            className="w-full rounded bg-indigo-400 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            onClick={() => auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-2">
      <div className="flex flex-col space-y-4 rounded-lg bg-white bg-opacity-80 p-4 shadow backdrop-blur-sm">
        <p>You are not signed in.</p>
        <form
          action="/auth/signin"
          className="flex flex-col space-y-4"
          onSubmit={async (e) => {
            setSubmitting(true);
            e.preventDefault();
            await sendSignInLinkToEmail(auth, ref.current!.value, {
              url: redirectUrl ?? window.location.href,
              handleCodeInApp: true,
            }).finally(() => {
              setSubmitting(false);
            });
            window.localStorage.setItem("emailForSignIn", ref.current!.value);
          }}
        >
          <input
            className="rounded border border-gray-300 px-4 py-2"
            type="email"
            placeholder="Email"
            id="email"
            required
            ref={ref}
            disabled={submitting}
          />
          <input
            disabled={submitting}
            type="submit"
            className="w-full rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            value="Sign in with magic link"
          />
        </form>
      </div>
    </div>
  );
}
