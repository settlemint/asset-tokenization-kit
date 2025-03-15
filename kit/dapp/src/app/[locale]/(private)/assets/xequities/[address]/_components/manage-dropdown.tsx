"use client";

import { GrantRoleForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/manage-dropdown/grant-role-form/form";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { equityGrantRoleAction } from "@/lib/mutations/asset/access-control/grant-role/grant-role-action";
import type { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { BurnForm } from "./burn-form/form";
import { MintForm } from "./mint-form/form";
import { PauseForm } from "./pause-form/form";

interface ManageDropdownProps {
	address: Address;
	equity: Awaited<ReturnType<typeof getEquityDetail>>;
}

export function ManageDropdown({ address, equity }: ManageDropdownProps) {
	const t = useTranslations("admin.equities.manage");

	const menuItems = useMemo(
		() =>
			[
				{
					id: "mint",
					label: t("actions.mint"),
				},
				{
					id: "burn",
					label: t("actions.burn"),
				},
				{
					id: "pause",
					label: equity.paused ? t("actions.unpause") : t("actions.pause"),
				},
				{
					id: "grant-role",
					label: t("actions.grant-role"),
				},
			] as const,
		[t, equity.paused],
	);
	const [openMenuItem, setOpenMenuItem] = useState<
		(typeof menuItems)[number]["id"] | null
	>(null);

	const onFormOpenChange = (open: boolean) => {
		if (!open) {
			setOpenMenuItem(null);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="default"
						className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-inset"
					>
						{t("manage")}
						<ChevronDown className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
					{menuItems.map((item) => (
						<DropdownMenuItem
							key={item.id}
							onSelect={() => setOpenMenuItem(item.id)}
						>
							{item.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<MintForm
				address={address}
				open={openMenuItem === "mint"}
				onOpenChange={onFormOpenChange}
			/>
			<BurnForm
				address={address}
				balance={Number(equity.totalSupply)}
				open={openMenuItem === "burn"}
				onOpenChange={onFormOpenChange}
			/>
			<PauseForm
				address={address}
				isPaused={equity.paused}
				open={openMenuItem === "pause"}
				onOpenChange={onFormOpenChange}
			/>
			<GrantRoleForm
				address={address}
				open={openMenuItem === "grant-role"}
				onOpenChange={onFormOpenChange}
				grantRoleAction={equityGrantRoleAction}
			/>
		</>
	);
}
