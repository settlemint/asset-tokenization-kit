import { FormCheckbox } from '@/components/blocks/form/inputs/form-checkbox';
import { ROLES, type Role, type RoleKey } from '@/lib/config/roles';
import { useFormContext } from 'react-hook-form';

interface RolesProps {
  currentRoles?: Role[];
  onRolesChange?: (newRoles: Role[]) => void;
}

export function Roles({ currentRoles = [], onRolesChange }: RolesProps) {
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
          {(Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]).map(
            ([key, role]) => (
              <FormCheckbox
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
            )
          )}
        </div>
      </div>
    </div>
  );
}

Roles.validatedFields = ['newRoles'] as const;
