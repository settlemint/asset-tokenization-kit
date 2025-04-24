"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { CreateDepositSchema } from "@/lib/mutations/deposit/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { AssetAdmins } from "../common/asset-admins/asset-admins";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";
interface CreateDepositFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateDepositForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateDepositFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && (open || localOpen)) {
      posthog.capture("create_deposit_form_opened");
    }
  }, [open, localOpen, posthog]);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.deposits")}
      description={t("description.deposits")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.deposits")
      }
    >
      <Form
        action={createDeposit}
        resolver={typeboxResolver(CreateDepositSchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.deposits"),
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
        defaultValues={{
          collateralLivenessValue: 12,
          collateralLivenessTimeUnit: "months",
          price: {
            amount: 1,
            currency: session?.user.currency,
          },
          assetAdmins: [],
        }}
        toastMessages={{
          action: (input) => {
            const assetId = input?.predictedAddress;
            return assetId
              ? {
                  label: t("toast-action.deposits"),
                  onClick: () => router.push(`/assets/deposit/${assetId}`),
                }
              : undefined;
          },
        }}
      >
        <Basics />
        <Configuration />
        <AssetAdmins />
        <Summary />
      </Form>
    </FormSheet>
  );
}
