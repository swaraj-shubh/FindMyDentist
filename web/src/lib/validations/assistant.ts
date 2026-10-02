import { z } from "zod";

export const assistantSchema = z.object({
  message: z.string().trim().min(3, "Tell us a little more about the problem").max(1000),
  hasImage: z.boolean().default(false),
});
