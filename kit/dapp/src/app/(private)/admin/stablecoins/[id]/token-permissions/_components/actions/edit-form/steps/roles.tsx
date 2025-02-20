import { AssetFormCheckbox } from '@/components/blocks/asset-form/inputs/asset-form-checkbox';
import type { PermissionRole } from '@/components/blocks/asset-permissions-table/asset-permissions-table-data';
import { useFormContext } from 'react-hook-form';

const ROLE_DEFINITIONS = {
  admin: {
    label: 'Admin',
    description: 'Grants full administrative privileges, including the ability to assign and manage all other roles',
  },
  supplyManager: {
    label: 'Supply Manager',
    description: 'Permits the account to mint new tokens, increasing the supply of the asset',
  },
  userManager: {
    label: 'User Manager',
    description: 'Allows the account to block and unblock users and to freeze and unfreeze accounts.',
  },
} as const satisfies Record<PermissionRole, { label: string; description: string }>;

interface RolesFormProps {
  currentRoles?: PermissionRole[];
  onRolesChange?: (newRoles: PermissionRole[]) => void;
}

export function RolesForm({ currentRoles = [], onRolesChange }: RolesFormProps) {
  const { control, getValues } = useFormContext();

  const handleChange = () => {
    // Get current form values after the checkbox change
    const formValues = getValues();
    if (formValues.newRoles && onRolesChange) {
      const selectedRoles = Object.entries(formValues.newRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([role]) => role as PermissionRole);

      onRolesChange(selectedRoles);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          {(
            Object.entries(ROLE_DEFINITIONS) as [
              PermissionRole,
              (typeof ROLE_DEFINITIONS)[keyof typeof ROLE_DEFINITIONS],
            ][]
          ).map(([role, def]) => (
            <AssetFormCheckbox
              key={role}
              name={`newRoles.${role}`}
              control={control}
              label={def.label}
              description={def.description}
              defaultValue={currentRoles.includes(role)}
              onChange={() => {
                handleChange();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

RolesForm.validatedFields = ['newRoles'] as const;
