"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { Role } from "@/lib/config/roles";
import { revokeRole } from "@/lib/mutations/stablecoin/revoke-role/revoke-role-action";
import { RevokeRoleSchema } from "@/lib/mutations/stablecoin/revoke-role/revoke-role-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

export interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
}

interface RevokeAllPermissionsFormPropsWithOpen
  extends RevokeAllPermissionsFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function RevokeAllPermissionsForm({
  address,
  account,
  currentRoles,
  open,
  setOpen,
}: RevokeAllPermissionsFormPropsWithOpen) {
  const t = useTranslations("admin.stablecoins.permissions.revoke-all-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t("trigger-label")}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={revokeRole}
        resolver={zodResolver(RevokeRoleSchema)}
        onOpenChange={setOpen}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          userAddress: account,
        }}
      >
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
