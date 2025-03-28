import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import {
  AssetUsersSchema,
  type AssetUsers,
} from "@/lib/queries/asset/asset-users-schema";
import { t as tb } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { Address } from "viem";

interface SelectAssetProps {
  onSelect: (asset: AssetUsers) => void;
  userWallet?: Address;
}

export function SelectAsset({ onSelect, userWallet }: SelectAssetProps) {
  const t = useTranslations("portfolio.transfer-form.select-asset");
  const { data: session } = authClient.useSession();
  const form = useForm<{ asset: AssetUsers }>({
    resolver: typeboxResolver(tb.Object({ asset: AssetUsersSchema })),
    mode: "onChange",
  });
  const { isValid } = form.formState;

  const handleConfirm = () => {
    const values = form.getValues();
    if (values.asset) {
      onSelect(values.asset);
    }
  };

  return (
    <Form {...form}>
      <div className="mx-4">
        <FormAssets
          control={form.control}
          name="asset"
          label={t("asset-label")}
          description={t("asset-description")}
          userWallet={userWallet}
        />
        <div className="mt-6 text-right">
          <Button disabled={!isValid} onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Form>
  );
}
