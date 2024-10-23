import { useSigninCheck } from "reactfire";
import { Link } from "../renderer/Link";
import { auth } from "../utils/firebase";

export default function AuthButton() {
  const signinCheck = useSigninCheck();
  const loading = signinCheck.status === "loading";
  const signedIn = !!signinCheck.data?.signedIn;
  const buttonText = loading ? "Loading..." : signedIn ? "Sign out" : "Sign in";
  if (loading)
    return (
      <>
        <button
          className="rounded bg-purple-600 px-4 py-2 font-bold text-sm text-white hover:bg-purple-700"
          disabled
        >
          {buttonText}
        </button>
      </>
    );
  if (signedIn)
    return (
      <>
        <Link
          href="/auth"
          onClick={(event) => {
            event.preventDefault();
            auth.signOut();
          }}
        >
          <button className="rounded bg-purple-600 px-4 py-2 font-bold text-sm text-white hover:bg-purple-700">
            {buttonText}
          </button>
        </Link>
      </>
    );
  return (
    <>
      <Link href="/auth">
        <button className="rounded bg-purple-600 px-4 py-2 font-bold text-sm text-white hover:bg-purple-700">
          {buttonText}
        </button>
      </Link>
    </>
  );
}
