import { z } from "zod";
import moment from "moment";

export const roomReadUniqueInputSchema = z.object({
  id: z.string().uuid(),
});
export const roomReadUniqueOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RoomReadUniqueInput = z.infer<typeof roomReadUniqueInputSchema>;
export type RoomReadUniqueOutput = z.infer<typeof roomReadUniqueOutputSchema>;

export const roomReadManyInputSchema = z.object({});
export const roomReadManyOutputSchema = z.object({
  rooms: z.array(roomReadUniqueOutputSchema),
});

export type RoomReadManyInput = z.infer<typeof roomReadManyInputSchema>;
export type RoomReadManyOutput = z.infer<typeof roomReadManyOutputSchema>;

export const roomCreateSchema = z.object({
  title: z.string(),
  markdown: z.string(),
  opensAt: z.string(),
  closesAt: z.string().default(moment().add(1, "years").toISOString()),
  published: z.boolean().default(false),
});

export const roomCreateOutputSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomCreateOutput = z.infer<typeof roomCreateOutputSchema>;
