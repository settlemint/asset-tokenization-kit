import { FormStep } from "@/components/blocks/form/form-step";
import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { ROLES, type Role, type RoleKey } from "@/lib/config/roles";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface RolesProps {
  currentRoles?: Role[];
  onRolesChange?: (newRoles: Role[]) => void;
}

export function Roles({ currentRoles = [], onRolesChange }: RolesProps) {
  const { control, getValues } = useFormContext();
  const t = useTranslations("admin.equities.permissions.edit-form.roles");

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
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            {(
              Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]
            ).map(([key, role]) => (
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
            ))}
          </div>
        </div>
      </div>
    </FormStep>
  );
}

Roles.validatedFields = ["newRoles"] as const;
