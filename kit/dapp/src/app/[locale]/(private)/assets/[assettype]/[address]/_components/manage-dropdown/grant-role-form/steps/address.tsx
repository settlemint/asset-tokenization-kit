import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function AdminAddress() {
	const { control } = useFormContext<GrantRoleInput>();
	const [isManualEntry, setIsManualEntry] = useState(false);
	const t = useTranslations("admin.stablecoins.grant-role-form.address");

	return (
		<FormStep title={t("title")} description={t("description")}>
			<div className="space-y-1">
				{isManualEntry ? (
					<FormInput
						control={control}
						name="userAddress"
						label={t("address-label")}
						placeholder={t("manual-placeholder")}
					/>
				) : (
					<FormUsers
						control={control}
						name="userAddress"
						label={t("address-label")}
						placeholder={t("search-placeholder")}
					/>
				)}
				<div className="flex justify-end">
					<button
						type="button"
						onClick={() => setIsManualEntry(!isManualEntry)}
						className="text-muted-foreground text-xs transition-colors hover:text-foreground"
					>
						{isManualEntry ? t("search-toggle") : t("manual-toggle")}
					</button>
				</div>
			</div>
		</FormStep>
	);
}

AdminAddress.validatedFields = ["userAddress"] as const;
