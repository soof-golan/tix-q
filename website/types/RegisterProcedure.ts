import { z } from "zod";

export let registerInputSchema = z.object({
  email: z.string().email(),
  legalName: z.string(),
  idNumber: z.string(),
  idType: z.enum(["PASSPORT", "ID_CARD"]),
  waitingRoomId: z.string().uuid(),
  phoneNumber: z.string(),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type RegisterOutput = {
  id: string;
  legalName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  idType: "PASSPORT" | "ID_CARD";
  waitingRoomId: string;
};
