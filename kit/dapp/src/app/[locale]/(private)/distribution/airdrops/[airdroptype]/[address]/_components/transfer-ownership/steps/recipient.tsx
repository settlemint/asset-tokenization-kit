"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { AirdropTransferOwnershipInput } from "@/lib/mutations/airdrop/transfer-ownership/transfer-ownership-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function Recipient() {
  const { control } = useFormContext<AirdropTransferOwnershipInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const t = useTranslations("private.assets.details.forms.account");

  return (
    <FormStep
      title={t("title.default")}
      description={t("description.transfer-ownership")}
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          {isManualEntry ? (
            <FormInput
              control={control}
              name="newOwner"
              placeholder={t("enter-wallet-address-placeholder")}
            />
          ) : (
            <FormUsers
              control={control}
              name="newOwner"
              placeholder={t("search-user-placeholder")}
            />
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsManualEntry(!isManualEntry)}
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              {isManualEntry
                ? t("search-user-instead")
                : t("enter-user-address-manually")}
            </button>
          </div>
        </div>
      </div>
    </FormStep>
  );
}

Recipient.validatedFields = ["newOwner"] satisfies (keyof AirdropTransferOwnershipInput)[];
