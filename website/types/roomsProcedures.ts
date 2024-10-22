import { z } from "zod";
import { eventChoiceSchema } from "./eventChoicesSchema";

export const roomQueryOutputSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string(),
  published: z.boolean(),
  desktopImageBlob: z.string().nullable(),
  mobileImageBlob: z.string().nullable(),
  eventChoices: eventChoiceSchema,
});

export const roomMutationInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string(),
  desktopImageBlob: z.string().nullable(),
  mobileImageBlob: z.string().nullable(),
  eventChoices: eventChoiceSchema,
});

export const roomStatsOutputSchema = z.object({
  id: z.string().uuid(),
  registrantsCount: z.number(),
});

export const roomParticipantsOutputSchema = z.object({
  id: z.string().uuid(),
  registrants: z.array(
    z.object({
      id: z.string().uuid(),
      legalName: z.string(),
      email: z.string().email(),
      phoneNumber: z.string(),
      idNumber: z.string(),
      idType: z.string(),
      eventChoice: z.string(),
      turnstileSuccess: z.string(),
      turnstileTimestamp: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});

export const roomQueryInputSchema = z.object({
  id: z.string().uuid(),
});

export const roomPublishInputSchema = z.object({
  id: z.string().uuid(),
  publish: z.boolean(),
});

export const roomReadUniqueOutputSchema = roomQueryOutputSchema;

export type RoomReadUniqueInput = z.infer<typeof roomQueryInputSchema>;
export type RoomReadUniqueOutput = z.infer<typeof roomReadUniqueOutputSchema>;

export const roomReadManyInputSchema = z.object({});
export const roomReadManyOutputSchema = z.array(roomReadUniqueOutputSchema);

export type RoomReadManyInput = z.infer<typeof roomReadManyInputSchema>;
export type RoomReadManyOutput = z.infer<typeof roomReadManyOutputSchema>;

export const roomCreateSchema = roomMutationInputSchema.omit({
  id: true,
});
export const roomCreateOutputSchema = roomQueryOutputSchema;

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomCreateOutput = z.infer<typeof roomCreateOutputSchema>;

export const roomUpdateInputSchema = roomMutationInputSchema;

export const roomUpdateOutputSchema = roomQueryOutputSchema;

export type RoomUpdateInput = z.infer<typeof roomUpdateInputSchema>;
export type RoomUpdateOutput = z.infer<typeof roomUpdateOutputSchema>;

export type RoomStatsOutput = z.infer<typeof roomStatsOutputSchema>;

export type RoomParticipantsOutput = z.infer<
  typeof roomParticipantsOutputSchema
>;

export type RoomPublishInput = z.infer<typeof roomPublishInputSchema>;
