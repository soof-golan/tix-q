import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {httpLink} from "@trpc/client";
import {PropsWithChildren, useState} from "react";
import {trpc} from "../utils/trpc";

export default function TrpcContext({children}: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: import.meta.env.PUBLIC_SERVER_URL,
          headers: async () => {
            return {
              "X-CSRF-Token": "csrf-token",
            };
          },
          fetch(url, options){
            return fetch(url, {
              ...options,
              credentials: "include"
            })
          }
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
