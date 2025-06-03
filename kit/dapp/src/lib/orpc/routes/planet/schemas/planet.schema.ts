import { z } from "zod";

export const PlanetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
