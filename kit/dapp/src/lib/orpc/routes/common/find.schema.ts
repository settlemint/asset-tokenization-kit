import { z } from "zod";

export const FindSchema = z.object({
  id: z.string(),
});
