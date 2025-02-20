import type { PermissionRole } from '@/components/blocks/asset-permissions-table/asset-permissions-table-data';
import { z } from 'zod';

export const EditRolesFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'PIN code must contain only numbers' }),
  newRoles: z
    .array(
      // We must provide literal values for Zod's runtime validation since PermissionRole type is not available at runtime
      z.enum(['admin', 'supplyManager', 'userManager'] as const satisfies readonly PermissionRole[])
    )
    .min(1, { message: 'At least one role must be selected' }),
  currentRoles: z
    .array(
      // We must provide literal values for Zod's runtime validation since PermissionRole type is not available at runtime
      z.enum(['admin', 'supplyManager', 'userManager'] as const satisfies readonly PermissionRole[])
    )
    .min(1, { message: 'At least one role must be selected' }),
  address: z.string().min(1, { message: 'Address is required' }),
  userAddress: z.string().min(1, { message: 'User is required' }),
});

export type EditRolesFormType = z.infer<typeof EditRolesFormSchema>;

export const EditRolesOutputSchema = z.array(z.string());
export type EditRolesOutputType = z.infer<typeof EditRolesOutputSchema>;
