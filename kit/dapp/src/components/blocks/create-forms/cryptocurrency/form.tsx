"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { CreateCryptoCurrencySchema } from "@/lib/mutations/cryptocurrency/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssetAdmins } from "../common/asset-admins/asset-admins";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateCryptoCurrencyFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  userDetails: User;
}

export function CreateCryptoCurrencyForm({
  open,
  onOpenChange,
  asButton = false,
  userDetails,
}: CreateCryptoCurrencyFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.cryptocurrencies")}
      description={t("description.cryptocurrencies")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.cryptocurrencies")
      }
    >
      <Form
        action={createCryptoCurrency}
        resolver={(...args) =>
          typeboxResolver(
            CreateCryptoCurrencySchema({
              decimals: args[0].decimals,
            })
          )(...args)
        }
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.cryptocurrencies"),
        }}
        defaultValues={{
          price: {
            amount: 1,
            currency: userDetails.currency,
          },
          verificationType: "pincode",
          predictedAddress: "0x0000000000000000000000000000000000000000",
          assetAdmins: [],
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <Configuration />
        <AssetAdmins userDetails={userDetails} />
        <Summary userDetails={userDetails} />
      </Form>
    </FormSheet>
  );
}
