import { z } from "zod";

/// Ensures the string is of the shape 'a,b,c'
export const eventChoiceSchema = z
  .string()
  .trim()
  .min(1, "No Event Choices")
  .max(256, "Too long")
  .transform((choice) => choice.split(","))
  .pipe(
    z
      .string()
      .trim()
      .array()
      .nonempty("No Event Choices")
      .transform((a) => a.filter((s) => !!s.length))
  )
  .transform((choices) => choices.join(","))
  .pipe(z.string().min(1, "No Event Choices"))
  .or(
    z
      .string()
      .trim()
      .max(0, "No Event Choices")
      .transform((s) => s.trim())
  );

export type EventChoices = z.infer<typeof eventChoiceSchema>;

console.log(eventChoiceSchema.parse("  abcd , efg, c , , ,  "));
