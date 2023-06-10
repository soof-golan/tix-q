import { StyledFirebaseAuth } from "react-firebaseui";
import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useSigninCheck } from "reactfire";

export { Page };

type AuthProps = {
  children?: never;
  redirectUrl?: string;
};

function Page({ redirectUrl }: AuthProps) {
  const signinCheck = useSigninCheck();
  if (signinCheck.status === "loading")
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
    <StyledFirebaseAuth
      uiConfig={{
        signInSuccessUrl: "/" ?? redirectUrl,
        signInOptions: [
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
          },
          GoogleAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          signInSuccessWithAuthResult: () => false,
        },
      }}
      firebaseAuth={auth}
    />
  );
}
