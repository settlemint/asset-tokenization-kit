import { type ZodInfer, z } from '@/lib/utils/zod';

export const getAddContactFormSchema = () => {
  return z.object({
    address: z.address(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
  });
};

export type AddContactFormSchema = ReturnType<typeof getAddContactFormSchema>;
export type AddContactFormType = ZodInfer<AddContactFormSchema>;

export const AddContactOutputSchema = z.array(z.string());
export type AddContactOutputType = ZodInfer<typeof AddContactOutputSchema>;
