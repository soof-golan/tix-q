import { z } from "zod";
import validator from "validator";

export const registerInputSchema = z.object({
  legalName: z.string().nonempty().max(100),
  email: z.string().max(100).nonempty().email(),
  idType: z.enum(["PASSPORT", "ID_CARD"]),
  idNumber: z.string().nonempty().max(100),
  phoneNumber: z
    .string()
    .nonempty()
    .max(100)
    .refine(
      (v) =>
        validator.isMobilePhone(v, "any", {
          strictMode: false,
        }),
      "Invalid phone number"
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
  waitingRoomId: string;
};
