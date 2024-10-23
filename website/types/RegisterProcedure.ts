import validator from "validator";
import { z } from "zod";

export const registerInputSchema = z.object({
  legalName: z.string().min(1, "Provide legal name").max(100, "Name too long"),
  email: z.string().email().max(100, "Email too long").min(1, "Provide email"),
  idNumber: z
    .string()
    .min(1, "Provide ID Number")
    .max(100, "ID Number too long"),
  idType: z.enum(["PASSPORT", "ID_CARD"]),
  eventChoice: z
    .string()
    .min(1, "Provide Event Choice")
    .max(100, "Event Choice too long"),
  phoneNumber: z
    .string()
    .min(1, "Provide phone number")
    .max(100, "Phone number too long")
    .refine(
      (v) =>
        validator.isMobilePhone(v, "any", {
          strictMode: false,
        }),
      "Invalid phone number",
    ),
  waitingRoomId: z.string().uuid(),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type RegisterOutput = {
  id: string;
  legalName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  idType: "PASSPORT" | "ID_CARD";
  eventChoice: string;
  waitingRoomId: string;
};
