import { z } from '@/lib/utils/zod';

export function getAddContactFormSchema() {
  return z.object({
    address: z.address(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
  });
}

export const AddContactOutputSchema = z.object({
  id: z.string(),
  wallet: z.string(),
  name: z.string(),
  user_id: z.string(),
  created_at: z.string(),
});

export type AddContactFormType = z.infer<typeof getAddContactFormSchema>;
export type AddContactOutputType = z.infer<typeof AddContactOutputSchema>;
