import { FormStep } from "@/components/blocks/form/form-step";
import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { ROLES, type RoleKey } from "@/lib/config/roles";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function AdminRoles() {
  const { control, watch } = useFormContext<GrantRoleInput>();
  const t = useTranslations("private.assets.details.forms");
  const assettype = watch("assettype");

  // Filter out USER_MANAGEMENT_ROLE for cryptocurrency assets
  const roleEntries = Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][];
  const filteredRoles = assettype === "cryptocurrency" 
    ? roleEntries.filter(([key]) => key !== "USER_MANAGEMENT_ROLE")
    : roleEntries;

  return (
    <FormStep title={t("roles.title")} description={t("roles.description")}>
      <div className="space-y-3">
        {filteredRoles.map(
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
    </FormStep>
  );
}

AdminRoles.validatedFields = ["roles"] as const;