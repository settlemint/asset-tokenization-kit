import { z } from 'zod';

export const AddTokenAdminFormSchema = z.object({
  roles: z
    .object({
      DEFAULT_ADMIN_ROLE: z.boolean(),
      SUPPLY_MANAGEMENT_ROLE: z.boolean(),
      USER_MANAGEMENT_ROLE: z.boolean(),
    })
    .refine((data) => Object.values(data).some(Boolean), {
      message: 'At least one role must be selected',
    }),
  address: z.string().min(1, { message: 'Token address is required' }),
  userAddress: z.string().min(1, { message: 'Admin address is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'PIN code must contain only numbers' }),
});

export type AddTokenAdminFormType = z.infer<typeof AddTokenAdminFormSchema>;

export const AddTokenAdminOutputSchema = z.array(z.string());

export type AddTokenAdminOutputType = z.infer<typeof AddTokenAdminOutputSchema>;
