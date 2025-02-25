import { FormCheckbox } from '@/components/blocks/form/inputs/form-checkbox';
import { ROLES, type RoleKey } from '@/lib/config/roles';
import type { GrantRole } from '@/lib/mutations/stablecoin/grant-role';
import { useFormContext } from 'react-hook-form';

export function AdminRoles() {
  const { control } = useFormContext<GrantRole>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-foreground text-lg">
          Select Admin Roles
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose the roles to grant to the new admin. At least one role must be
          selected.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {(Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]).map(
            ([key, role]) => (
              <FormCheckbox
                key={key}
                name={`roles.${role.contractRole}`}
                control={control}
                label={role.displayName}
                description={role.description}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

AdminRoles.validatedFields = ['roles'] as const;
