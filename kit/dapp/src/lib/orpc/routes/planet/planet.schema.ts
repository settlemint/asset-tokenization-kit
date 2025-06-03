import { z } from "zod/v4";

export const PlanetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
