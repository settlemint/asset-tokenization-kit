import { z } from "zod";

export const getAddContactFormSchema = () => {
  return z.object({
    address: z.string().min(1, { message: "Address is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
  });
};

export type AddContactFormSchema = ReturnType<typeof getAddContactFormSchema>;
export type AddContactFormType = z.infer<AddContactFormSchema>;

export const AddContactOutputSchema = z.string();
export type AddContactOutputType = z.infer<typeof AddContactOutputSchema>;
