import { protectedProcedure, publicProcedure, router } from "./trpc";
import {
  registerInputSchema,
  type RegisterOutput,
} from "../types/RegisterProcedure";
import {
  markdownEditInputSchema,
  type MarkdownEditOutput,
} from "../types/MarkdownEditProcedure";
import {
  markdownReadInputSchema,
  MarkdownReadOutput,
} from "../types/MarkdownReadProcedure";
import {
  RoomCreateOutput,
  roomCreateSchema,
  roomUpdateInputSchema,
  RoomUpdateOutput,
  roomReadManyInputSchema,
  RoomReadManyOutput,
  roomQueryInputSchema,
  RoomReadUniqueOutput,
} from "../types/roomsProcedures";

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
    read: protectedProcedure
      .input(markdownReadInputSchema)
      .query(async (): Promise<MarkdownReadOutput> => {
        return {} as MarkdownReadOutput;
      }),
  }),
  room: router({
    readUnique: protectedProcedure
      .input(roomQueryInputSchema)
      .query(async (): Promise<RoomReadUniqueOutput> => {
        return {} as RoomReadUniqueOutput;
      }),
    readMany: protectedProcedure
      .input(roomReadManyInputSchema)
      .query(async (): Promise<RoomReadManyOutput> => {
        return {} as RoomReadManyOutput;
      }),
    create: protectedProcedure
      .input(roomCreateSchema)
      .mutation(async (): Promise<RoomCreateOutput> => {
        return {} as RoomCreateOutput;
      }),
    update: protectedProcedure
      .input(roomUpdateInputSchema)
      .mutation(async (): Promise<RoomUpdateOutput> => {
        return {} as RoomUpdateOutput;
      }),
    publish: protectedProcedure
      .input(roomQueryInputSchema)
      .mutation(async (): Promise<RoomUpdateOutput> => {
        return {} as RoomUpdateOutput;
      }),
  }),
});

// Export only the "type" of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
