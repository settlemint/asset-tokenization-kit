import { FormStep } from "@/components/blocks/form/form-step";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { DistributeInput } from "@/lib/mutations/airdrop/distribute/distribute-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Recipients({ airdrop }: { airdrop: PushAirdrop }) {
  const t = useTranslations(
    "private.airdrops.detail.forms.distribute.recipients"
  );
  const { control } = useFormContext<DistributeInput>();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <FormUsers
            control={control}
            name="recipient"
            placeholder={t("search-user-placeholder")}
            allowedAddresses={airdrop.distribution.map(
              (item) => item.recipient
            )}
          />
        </div>
      </div>
    </FormStep>
  );
}

Recipients.validatedFields = ["recipient"] satisfies (keyof DistributeInput)[];
