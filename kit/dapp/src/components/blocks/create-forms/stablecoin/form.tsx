"use client";

import { TokenAdmins } from "@/components/blocks/create-forms/common/token-admins/token-admins";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateStablecoinFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  userDetails: User;
}

export function CreateStablecoinForm({
  open,
  onOpenChange,
  asButton = false,
  userDetails,
}: CreateStablecoinFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.stablecoins")}
      description={t("description.stablecoins")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.stablecoins")
      }
    >
      <Form
        action={createStablecoin}
        resolver={typeboxResolver(CreateStablecoinSchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.stablecoins"),
        }}
        defaultValues={{
          collateralLivenessValue: 12,
          collateralLivenessTimeUnit: "months",
          price: {
            amount: 1,
            currency: userDetails.currency,
          },
          tokenAdmins: [
            {
              wallet: userDetails.wallet,
              roles: ["admin", "user-manager", "issuer"]
            }
          ]
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <TokenAdmins userDetails={userDetails} />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
