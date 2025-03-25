import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { disallowUser } from "@/lib/mutations/disallow-user/disallow-user-action";
import { DisallowUserSchema } from "@/lib/mutations/disallow-user/disallow-user-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";
import { User } from "./steps/user";

interface DisallowUserActionProps {
  userAddress?: Address;
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisallowForm({
  userAddress,
  address,
  assettype,
  open,
  onOpenChange,
}: DisallowUserActionProps) {
  const t = useTranslations("private.assets.details.forms");
  const steps = userAddress
    ? [<Summary key="summary" />]
    : [<User key="user" />, <Summary key="summary" />];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("form.trigger-label.disallow")}
      title={t("form.title.disallow")}
      description={t("form.description.disallow")}
    >
      <Form
        action={disallowUser}
        resolver={typeboxResolver(DisallowUserSchema())}
        buttonLabels={{
          label: t("form.trigger-label.disallow"),
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
