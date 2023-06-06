import { z } from "zod";

export const roomQueryOutputSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string(),
  published: z.boolean(),
});

export const roomMutationInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string(),
});

export const roomQueryInputSchema = z.object({
  id: z.string().uuid(),
});
export const roomReadUniqueOutputSchema = roomQueryOutputSchema;

export type RoomReadUniqueInput = z.infer<typeof roomQueryInputSchema>;
export type RoomReadUniqueOutput = z.infer<typeof roomReadUniqueOutputSchema>;

export const roomReadManyInputSchema = z.object({});
export const roomReadManyOutputSchema = z.array(roomReadUniqueOutputSchema);

export type RoomReadManyInput = z.infer<typeof roomReadManyInputSchema>;
export type RoomReadManyOutput = z.infer<typeof roomReadManyOutputSchema>;

export const roomCreateSchema = roomMutationInputSchema;
export const roomCreateOutputSchema = roomQueryOutputSchema;

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomCreateOutput = z.infer<typeof roomCreateOutputSchema>;

export const roomUpdateInputSchema = roomMutationInputSchema;

export const roomUpdateOutputSchema = roomQueryOutputSchema;

export type RoomUpdateInput = z.infer<typeof roomUpdateInputSchema>;
export type RoomUpdateOutput = z.infer<typeof roomUpdateOutputSchema>;
