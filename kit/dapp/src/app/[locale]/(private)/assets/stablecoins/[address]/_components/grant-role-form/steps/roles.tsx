import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { ROLES, type RoleKey } from "@/lib/config/roles";
import type { GrantRoleInput } from "@/lib/mutations/stablecoin/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function AdminRoles() {
  const { control } = useFormContext<GrantRoleInput>();
  const t = useTranslations("admin.stablecoins.grant-role-form.roles");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-foreground text-lg">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
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

AdminRoles.validatedFields = ["roles"] as const;
