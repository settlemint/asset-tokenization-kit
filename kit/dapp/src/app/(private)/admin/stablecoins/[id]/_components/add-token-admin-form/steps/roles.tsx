import { AssetFormCheckbox } from '@/components/blocks/asset-form/inputs/asset-form-checkbox';
import { ROLES, type RoleKey } from '@/lib/config/roles';
import { useFormContext } from 'react-hook-form';
import type { AddTokenAdminFormType } from '../schema';

export function AdminRoles() {
  const { control } = useFormContext<AddTokenAdminFormType>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-foreground text-lg">Select Admin Roles</h2>
        <p className="text-muted-foreground text-sm">
          Choose the roles to grant to the new admin. At least one role must be selected.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {(Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]).map(([key, role]) => (
            <AssetFormCheckbox
              key={key}
              name={`roles.${role.contractRole}`}
              control={control}
              label={role.displayName}
              description={role.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

AdminRoles.validatedFields = ['roles'] as const;
