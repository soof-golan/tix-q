import {
  type RegisterOutput,
  registerInputSchema,
} from "../types/RegisterProcedure";
import { protectedProcedure, publicProcedure, router } from "./trpc";

import {
  RoomCreateOutput,
  RoomParticipantsOutput,
  RoomReadManyOutput,
  RoomReadUniqueOutput,
  RoomStatsOutput,
  RoomUpdateOutput,
  roomCreateSchema,
  roomPublishInputSchema,
  roomQueryInputSchema,
  roomReadManyInputSchema,
  roomUpdateInputSchema,
} from "../types/roomsProcedures";

export const appRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async (): Promise<RegisterOutput> => {
      return {} as RegisterOutput;
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
      .input(roomPublishInputSchema)
      .mutation(async (): Promise<RoomUpdateOutput> => {
        return {} as RoomUpdateOutput;
      }),
    stats: protectedProcedure
      .input(roomQueryInputSchema)
      .query(async (): Promise<RoomStatsOutput> => {
        return {} as RoomStatsOutput;
      }),
    registrants: protectedProcedure
      .input(roomQueryInputSchema)
      .query(async (): Promise<RoomParticipantsOutput> => {
        return {} as RoomParticipantsOutput;
      }),
  }),
});

// Export only the "type" of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
