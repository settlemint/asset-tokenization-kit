"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { createBond } from "@/lib/mutations/bond/create/create-action";
import { CreateBondSchema } from "@/lib/mutations/bond/create/create-schema";
import { getTomorrowMidnight } from "@/lib/utils/date";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssetAdmins } from "../common/asset-admins/asset-admins";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateBondFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateBondForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateBondFormProps) {
  const router = useRouter();
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.bonds")}
      description={t("description.bonds")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.bonds")
      }
    >
      <Form
        action={createBond}
        resolver={(...args) =>
          typeboxResolver(
            CreateBondSchema({
              decimals: args[0].decimals,
            })
          )(...args)
        }
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.bonds"),
        }}
        defaultValues={{
          price: {
            amount: 1,
            currency: session?.user.currency,
          },
          maturityDate: getTomorrowMidnight(),
          verificationType: "pincode",
          predictedAddress: "0x0000000000000000000000000000000000000000",
          assetAdmins: [],
        }}
        toastMessages={{
          action: (input) => {
            const assetId = input?.predictedAddress;
            return assetId
              ? {
                  label: "View bond",
                  onClick: () => router.push(`/assets/bond/${assetId}`),
                }
              : undefined;
          },
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
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
