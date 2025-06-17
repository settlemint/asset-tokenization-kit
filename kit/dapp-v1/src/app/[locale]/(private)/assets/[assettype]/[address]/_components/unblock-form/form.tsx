import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { unblockUser } from "@/lib/mutations/unblock-user/unblock-user-action";
import { UnblockUserSchema } from "@/lib/mutations/unblock-user/unblock-user-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";
import { User } from "./steps/user";

interface UnblockUserActionProps {
  userAddress?: Address;
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnblockForm({
  userAddress,
  address,
  assettype,
  open,
  onOpenChange,
}: UnblockUserActionProps) {
  const t = useTranslations("private.assets.details.forms");
  const steps = userAddress
    ? [<Summary key="summary" />]
    : [<User key="user" />, <Summary key="summary" />];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("form.trigger-label.unblock")}
      title={t("form.title.unblock")}
      description={t("form.description.unblock")}
    >
      <Form
        action={unblockUser}
        resolver={typeboxResolver(UnblockUserSchema())}
        buttonLabels={{
          label: t("form.trigger-label.unblock"),
        }}
        onOpenChange={onOpenChange}
        defaultValues={{
          address,
          userAddress,
          assettype,
        }}
      >
        {steps.map((step) => step)}
      </Form>
    </FormSheet>
  );
}
