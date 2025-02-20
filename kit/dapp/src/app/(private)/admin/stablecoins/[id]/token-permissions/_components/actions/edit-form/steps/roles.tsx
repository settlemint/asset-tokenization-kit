import { AssetFormCheckbox } from '@/components/blocks/asset-form/inputs/asset-form-checkbox';
import { ROLES, type Role, type RoleKey } from '@/lib/config/roles';
import { useFormContext } from 'react-hook-form';

interface RolesFormProps {
  currentRoles?: Role[];
  onRolesChange?: (newRoles: Role[]) => void;
}

export function RolesForm({ currentRoles = [], onRolesChange }: RolesFormProps) {
  const { control, getValues } = useFormContext();

  const handleChange = () => {
    // Get current form values after the checkbox change
    const formValues = getValues();
    if (formValues.newRoles && onRolesChange) {
      const selectedRoles = Object.entries(formValues.newRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([role]) => role as Role);

      onRolesChange(selectedRoles);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          {(Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]).map(([key, role]) => (
            <AssetFormCheckbox
              key={key}
              name={`newRoles.${role.contractRole}`}
              control={control}
              label={role.displayName}
              description={role.description}
              defaultValue={currentRoles.includes(role.contractRole)}
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
