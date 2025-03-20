import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { blockUser } from "@/lib/mutations/block-user/block-user-action";
import { BlockUserSchema } from "@/lib/mutations/block-user/block-user-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";
import { User } from "./steps/user";

interface BlockFormProps {
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userAddress?: Address;
}

export function BlockForm({
  address,
  assettype,
  userAddress,
  open,
  onOpenChange,
}: BlockFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const steps = userAddress
    ? [<Summary key="summary" />]
    : [<User key="user" />, <Summary key="summary" />];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label.block")}
      title={t("title.block")}
      description={t("description.block")}
    >
      <Form
        action={blockUser}
        resolver={zodResolver(BlockUserSchema)}
        buttonLabels={{
          label: t("trigger-label.block"),
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
