import { FormStep } from "@/components/blocks/form/form-step";
import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { getRoles, ROLES } from "@/lib/config/roles";
import type { UpdateRolesInput } from "@/lib/mutations/asset/access-control/update-role/update-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface RolesProps {
  disableEditAdminRole: boolean;
}

export function Roles({ disableEditAdminRole }: RolesProps) {
  const { control, getValues } = useFormContext<UpdateRolesInput>();
  const t = useTranslations(
    "private.assets.details.permissions.edit-form.roles"
  );
  const assettype = getValues("assettype");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-3">
        {getRoles(assettype).map((role) => {
          const roleInfo = ROLES[role];
          return (
            <FormCheckbox
              key={role}
              name={`roles.${role}`}
              control={control}
              label={roleInfo.displayName}
              description={roleInfo.description}
              disabled={
                disableEditAdminRole &&
                role === ROLES.DEFAULT_ADMIN_ROLE.contractRole
              }
            />
          );
        })}
      </div>
    </FormStep>
  );
}

Roles.validatedFields = ["roles"] satisfies (keyof UpdateRolesInput)[];
