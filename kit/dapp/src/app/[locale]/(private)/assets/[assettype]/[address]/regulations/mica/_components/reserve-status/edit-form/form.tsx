"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import {
  ReserveComplianceStatus,
  TokenType,
  type MicaRegulationConfig,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateReserves } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-action";
import { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import { formatToDateTimeInput } from "@/lib/utils/date";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { AuditDetails } from "./steps/audit-details";
import { Composition } from "./steps/composition";
import { TokenType as TokenTypeStep } from "./steps/token-type";

interface ReserveFormProps {
  address: Address;
  config: MicaRegulationConfig;
}

export function ReserveForm({ address, config }: ReserveFormProps) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status.form");
  const [open, setOpen] = useState(false);

  const steps = [
    <TokenTypeStep key="token-type" />,
    <Composition key="composition" />,
    <AuditDetails key="audit-details" config={config} />,
  ];

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
        buttonLabels={{
          label: t("save"),
          submittingLabel: t("saving"),
          processingLabel: t("saving"),
        }}
        onOpenChange={setOpen}
        defaultValues={{
          address,
          tokenType:
            (config.tokenType as TokenType) ?? TokenType.ELECTRONIC_MONEY_TOKEN,
          bankDeposits: config.reserveComposition?.bankDeposits ?? 0,
          governmentBonds: config.reserveComposition?.governmentBonds ?? 0,
          liquidAssets: config.reserveComposition?.highQualityLiquidAssets ?? 0,
          corporateBonds: config.reserveComposition?.corporateBonds ?? 0,
          centralBankAssets: config.reserveComposition?.centralBankAssets ?? 0,
          commodities: config.reserveComposition?.commodities ?? 0,
          otherAssets: config.reserveComposition?.otherAssets ?? 0,
          lastAuditDate: formatToDateTimeInput(
            config.lastAuditDate ?? new Date()
          ),
          reserveStatus:
            (config.reserveStatus as ReserveComplianceStatus) ??
            ReserveComplianceStatus.PENDING_REVIEW,
        }}
      >
        {steps}
      </Form>
    </FormSheet>
  );
}
