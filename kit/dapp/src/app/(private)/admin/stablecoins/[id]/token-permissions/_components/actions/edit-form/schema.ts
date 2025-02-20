import type { Role } from '@/lib/config/roles';
import { z } from 'zod';

export const EditRolesFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'PIN code must contain only numbers' }),
  newRoles: z.object({
    DEFAULT_ADMIN_ROLE: z.boolean(),
    SUPPLY_MANAGEMENT_ROLE: z.boolean(),
    USER_MANAGEMENT_ROLE: z.boolean(),
  }),
  currentRoles: z
    .array(
      // We must provide literal values for Zod's runtime validation since Role type is not available at runtime
      z.enum([
        'DEFAULT_ADMIN_ROLE',
        'SUPPLY_MANAGEMENT_ROLE',
        'USER_MANAGEMENT_ROLE',
      ] as const satisfies readonly Role[])
    )
    .min(1, { message: 'At least one role must be selected' }),
  address: z.string().min(1, { message: 'Address is required' }),
  userAddress: z.string().min(1, { message: 'User is required' }),
});

export type EditRolesFormType = z.infer<typeof EditRolesFormSchema>;

export const EditRolesOutputSchema = z.array(z.string());
export type EditRolesOutputType = z.infer<typeof EditRolesOutputSchema>;
