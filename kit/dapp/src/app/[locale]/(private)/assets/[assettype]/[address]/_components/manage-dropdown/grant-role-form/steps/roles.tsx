import { FormStep } from "@/components/blocks/form/form-step";
import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { getRoles, ROLES } from "@/lib/config/roles";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function AdminRoles() {
  const { control, getValues } = useFormContext<GrantRoleInput>();
  const t = useTranslations("private.assets.details.forms");
  const assettype = getValues("assettype");

  return (
    <FormStep title={t("roles.title")} description={t("roles.description")}>
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
            />
          );
        })}
      </div>
    </FormStep>
  );
}

AdminRoles.validatedFields = ["roles"] satisfies (keyof GrantRoleInput)[];
