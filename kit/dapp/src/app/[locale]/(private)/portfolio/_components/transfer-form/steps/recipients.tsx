import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import { authClient } from "@/lib/auth/client";
import type { TransferInput } from "@/lib/mutations/transfer/transfer-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function Recipients() {
  const { control } = useFormContext<TransferInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;

  const t = useTranslations("portfolio.transfer-form.recipients");

  // Determine placeholder text based on user role
  const placeholder =
    userRole === "user" ? t("search-in-contacts") : t("address-placeholder");

  // Determine search link text based on user role
  const searchLinkText =
    userRole === "user" ? t("search-contact-link") : t("search-user-link");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          {isManualEntry ? (
            <FormInput
              control={control}
              name="to"
              label={t("wallet-address-label")}
              placeholder="0x0000000000000000000000000000000000000000"
            />
          ) : (
            <FormUsers
              control={control}
              name="to"
              label={t("wallet-address-label")}
              placeholder={placeholder}
            />
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsManualEntry(!isManualEntry)}
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              {isManualEntry ? searchLinkText : t("manual-entry-link")}
            </button>
          </div>
        </div>
      </div>
    </FormStep>
  );
}

Recipients.validatedFields = ["to"] satisfies (keyof TransferInput)[];
