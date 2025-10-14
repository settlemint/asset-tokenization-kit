import { UserSchema } from "@/orpc/routes/user/routes/user.me.schema";
import * as z from "zod";

/**
 * Admin list response schema.
 */
export const AdminListOutputSchema = UserSchema.array();

export type AdminList = z.infer<typeof AdminListOutputSchema>;
