import { z } from "zod";

export const markdownReadInputSchema = z.object({
  id: z.string().uuid(),
});
const markdownReadOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MarkdownReadInput = z.infer<typeof markdownReadInputSchema>;
export type MarkdownReadOutput = z.infer<typeof markdownReadOutputSchema>;
