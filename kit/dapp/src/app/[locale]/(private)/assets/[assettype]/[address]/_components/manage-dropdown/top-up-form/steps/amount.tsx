"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
	const { control } = useFormContext<TopUpInput>();
	const t = useTranslations("private.assets.details.forms.top-up.amount");

	return (
		<FormStep title={t("title")} description={t("description")}>
			<FormInput
				control={control}
				name="amount"
				type="number"
				min={0}
				step="any"
				label={t("amount.label")}
				description={t("amount.description")}
			/>
		</FormStep>
	);
}

Amount.validatedFields = ["amount"] as const;
