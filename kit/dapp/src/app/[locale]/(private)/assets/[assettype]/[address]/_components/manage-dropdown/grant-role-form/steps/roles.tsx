import { FormStep } from "@/components/blocks/form/form-step";
import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { ROLES, type RoleKey } from "@/lib/config/roles";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function AdminRoles() {
	const { control } = useFormContext<GrantRoleInput>();
	const t = useTranslations("private.assets.details.forms.grant-role.roles");

	return (
		<FormStep title={t("title")} description={t("description")}>
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
					),
				)}
			</div>
		</FormStep>
	);
}

AdminRoles.validatedFields = ["roles"] as const;
