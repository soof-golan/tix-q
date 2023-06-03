import { publicProcedure, router } from "./trpc";
import {
  RegisterOutput,
  registerInputSchema,
} from "../types/RegisterProcedure";

const appRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async (): Promise<RegisterOutput> => {
      return {} as RegisterOutput;
    }),
});

// Export only the "type" of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
