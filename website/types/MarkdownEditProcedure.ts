import { z } from "zod";

export const markdownEditInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nonempty(),
  markdown: z.string().nonempty(),
});
const markdownEditOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  markdown: z.string(),
  updatedAt: z.string(),
});
export type MarkdownEditInput = z.infer<typeof markdownEditInputSchema>;
export type MarkdownEditOutput = z.infer<typeof markdownEditOutputSchema>;
