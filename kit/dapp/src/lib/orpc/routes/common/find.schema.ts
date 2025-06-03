import { z } from "zod/v4";

export const FindSchema = z.object({
  id: z.string(),
});
