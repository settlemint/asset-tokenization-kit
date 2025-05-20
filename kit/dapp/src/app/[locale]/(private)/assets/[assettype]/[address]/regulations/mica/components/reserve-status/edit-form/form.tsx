"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { TokenType as TokenTypeEnum } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateReserves } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-action";
import { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Composition } from "./steps/composition";
import { TokenType } from "./steps/token-type";

interface ReserveFormProps {
  address: Address;
}

export function ReserveForm({ address }: ReserveFormProps) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status.form");
  const [open, setOpen] = useState(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("title")}
      description={t("description")}
      triggerLabel={t("trigger-label")}
      asButton
    >
      <Form
        action={updateReserves}
        resolver={typeboxResolver(UpdateReservesSchema())}
        onOpenChange={setOpen}
        defaultValues={{
          address,
          tokenType: TokenTypeEnum.ELECTRONIC_MONEY_TOKEN,
          bankDeposits: 0,
          governmentBonds: 0,
          highQualityLiquidAssets: 0,
          corporateBonds: 0,
          centralBankAssets: 0,
          commodities: 0,
          otherAssets: 0,
        }}
      >
        <TokenType />
        <Composition />
      </Form>
    </FormSheet>
  );
}
