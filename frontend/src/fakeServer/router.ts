import { protectedProcedure, publicProcedure, router } from "./trpc";
import {
  registerInputSchema,
  type RegisterOutput,
} from "../types/RegisterProcedure";
import {
  markdownEditInputSchema,
  type MarkdownEditOutput,
} from "../types/ContentEditProcedure";

export const appRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async (): Promise<RegisterOutput> => {
      return {} as RegisterOutput;
    }),

  markdown: router({
    edit: protectedProcedure
      .input(markdownEditInputSchema)
      .mutation(async (): Promise<MarkdownEditOutput> => {
        return {} as MarkdownEditOutput;
      }),
  }),
});

// Export only the "type" of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
