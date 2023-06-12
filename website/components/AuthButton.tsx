import { useSigninCheck } from "reactfire";
import { auth } from "../utils/firebase";
import { FirebaseContext } from "./FirebaseContext";
import { Link } from "../renderer/Link";

export default function AuthButton() {
  const signinCheck = useSigninCheck();
  const loading = signinCheck.status === "loading";
  const signedIn = !!signinCheck.data?.signedIn;
  const buttonText = loading ? "Loading..." : signedIn ? "Sign out" : "Sign in";
  if (loading)
    return (
      <>
        <button
          className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
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
          <button className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
            {buttonText}
          </button>
        </Link>
      </>
    );
  return (
    <>
      <a href="/auth">
        <button className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
          {buttonText}
        </button>
      </a>
    </>
  );
}
