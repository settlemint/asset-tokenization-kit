"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { GrantRoleActionType } from "@/lib/mutations/asset/access-control/grant-role/grant-role-action";
import { GrantRoleSchema } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { AdminAddress } from "./steps/address";
import { AdminRoles } from "./steps/roles";
import { Summary } from "./steps/summary";

interface GrantRoleFormProps {
	address: Address;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	grantRoleAction: GrantRoleActionType;
}

export function GrantRoleForm({
	address,
	open,
	onOpenChange,
	grantRoleAction,
}: GrantRoleFormProps) {
	const t = useTranslations("private.assets.details.forms.grant-role");

	return (
		<FormSheet
			open={open}
			onOpenChange={onOpenChange}
			title={t("title")}
			description={t("description")}
		>
			<Form
				action={grantRoleAction}
				resolver={zodResolver(GrantRoleSchema)}
				onOpenChange={onOpenChange}
				buttonLabels={{
					label: t("button-label"),
				}}
				defaultValues={{
					address,
					roles: {
						DEFAULT_ADMIN_ROLE: false,
						SUPPLY_MANAGEMENT_ROLE: false,
						USER_MANAGEMENT_ROLE: false,
					},
				}}
			>
				<AdminAddress />
				<AdminRoles />
				<Summary address={address} />
			</Form>
		</FormSheet>
	);
}
