import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { allowUser } from "@/lib/mutations/allow-user/allow-user-action";
import { AllowUserSchema } from "@/lib/mutations/allow-user/allow-user-schema";
import type { AssetType } from "@/lib/utils/zod";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";
import { User } from "./steps/user";

interface AllowUserActionProps {
  userAddress?: Address;
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllowForm({
  userAddress,
  address,
  assettype,
  open,
  onOpenChange,
}: AllowUserActionProps) {
  const t = useTranslations("private.assets.details.forms");
  const steps = userAddress
    ? [<Summary key="summary" />]
    : [<User key="user" />, <Summary key="summary" />];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("form.trigger-label.allow")}
      title={t("form.title.allow")}
      description={t("form.description.allow")}
    >
      <Form
        action={allowUser}
        resolver={typeboxResolver(AllowUserSchema())}
        buttonLabels={{
          label: t("form.trigger-label.allow"),
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
