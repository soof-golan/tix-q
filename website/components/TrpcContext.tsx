import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { useAuth, useSigninCheck } from "reactfire";
import { useTurnstile } from "./TurnstileContext";

export default function TrpcContext({ children }: PropsWithChildren) {
  const [turnstileToken] = useTurnstile();
  const signInCheck = useSigninCheck();
  const auth = useAuth();
  const [queryClient] = useState(() => new QueryClient());

  const headers = useCallback(async () => {
    await signInCheck.firstValuePromise;
    const idToken = await auth.currentUser?.getIdToken?.();
    return {
      "X-CSRF-Token": "csrf-token",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
    };
  }, [auth.currentUser, signInCheck.firstValuePromise, turnstileToken]);

  const createClient = useCallback(() => {
    return trpc.createClient({
      links: [
        httpLink({
          url: import.meta.env.PUBLIC_SERVER_URL,
          headers: headers,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    });
  }, [headers]);

  const [trpcClient, setClient] = useState(() => createClient());
  useEffect(() => {
    setClient(createClient());
  }, [createClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
