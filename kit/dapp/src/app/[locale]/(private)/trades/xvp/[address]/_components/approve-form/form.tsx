"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { approveXvp } from "@/lib/mutations/xvp/approve/approve-action";
import { ApproveXvpSchema } from "@/lib/mutations/xvp/approve/approve-schema";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface ApproveFormProps {
  xvp: XvPSettlement;
  userAddress: Address;

  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveForm({
  xvp,
  userAddress,
  open,
  onOpenChange,
}: ApproveFormProps) {
  const t = useTranslations("trade-management.xvp");
  const isApproved = xvp.approvals.some(
    (approval) => approval.account.id === userAddress
  );
  // if (isApproved) {
  //   return (
  //     <FormSheet
  //       open={open}
  //       onOpenChange={onOpenChange}
  //       title={t("title.unpause")}
  //       description={t("description.unpause")}
  //     >
  //       <Form
  //         action={unpause}
  //         resolver={typeboxResolver(UnpauseSchema())}
  //         onOpenChange={onOpenChange}
  //         buttonLabels={{
  //           label: t("trigger-label.unpause"),
  //         }}
  //         defaultValues={{
  //           address,
  //           assettype,
  //         }}
  //       >
  //         <Summary address={address} isCurrentlyPaused={isPaused} />
  //       </Form>
  //     </FormSheet>
  //   );
  // }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("approve")}
      description={t("approve-description")}
    >
      <Form
        action={approveXvp}
        resolver={typeboxResolver(ApproveXvpSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("approve"),
        }}
        defaultValues={{
          xvp: xvp.id,
          approved: isApproved,
        }}
      >
        <Summary xvp={xvp} />
      </Form>
    </FormSheet>
  );
}
