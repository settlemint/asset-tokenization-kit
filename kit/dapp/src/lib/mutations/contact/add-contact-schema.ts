import { z } from "@/lib/utils/zod";
import type { infer as zodInfer } from "zod";

export function getAddContactFormSchema() {
  return z.object({
    address: z.address(),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
  });
}

export const AddContactOutputSchema = z.object({
  id: z.string(),
  wallet: z.string(),
  name: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  lastTransaction: z.object({
    hash: z.string(),
    status: z.enum(["success", "pending", "error"]).default("success"),
  }),
});

export type AddContactFormType = zodInfer<
  ReturnType<typeof getAddContactFormSchema>
>;
export type AddContactOutputType = zodInfer<typeof AddContactOutputSchema>;
