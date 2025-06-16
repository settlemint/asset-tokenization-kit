import { z } from "zod/v4";

export const AccountCreateSchema = z.object({
  userId: z.string().describe("The id of the user to create an account for"),
});
