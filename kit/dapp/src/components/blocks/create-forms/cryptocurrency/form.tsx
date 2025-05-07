"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { CreateCryptoCurrencySchema } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { AssetAdmins } from "../common/asset-admins/asset-admins";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateCryptoCurrencyFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateCryptoCurrencyForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateCryptoCurrencyFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && (open || localOpen)) {
      posthog.capture("create_cryptocurrency_form_opened");
    }
  }, [open, localOpen, posthog]);

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
            currency: session?.user.currency,
          },
          verificationType: "pincode",
          predictedAddress: "0x0000000000000000000000000000000000000000",
          assetAdmins: [],
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors("predictedAddress");
        }}
        toastMessages={{
          action: (input) => {
            const assetId = input?.predictedAddress;
            return assetId
              ? {
                  label: t("toast-action.cryptocurrencies"),
                  onClick: () =>
                    router.push(`/assets/cryptocurrency/${assetId}`),
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
