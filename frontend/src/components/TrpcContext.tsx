import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { PropsWithChildren, useState } from "react";
import { trpc } from "../utils/trpc";
import { useAuth, useSigninCheck, useUser } from "reactfire";

export default function TrpcContext({ children }: PropsWithChildren) {
  const signInCheck = useSigninCheck({ forceRefresh: true });
  const auth = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: import.meta.env.PUBLIC_SERVER_URL,
          headers: async () => {
            await signInCheck.firstValuePromise;
            const token = await auth.currentUser?.getIdToken?.();
            return {
              "X-CSRF-Token": "csrf-token",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
