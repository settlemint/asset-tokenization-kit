"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { addAdmin } from "@/lib/mutations/admin/add-admin-action";
import { getAddAdminFormSchema } from "@/lib/mutations/admin/add-admin-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { Admin } from "./steps/admin";

export function AddAdminForm({
  open,
  onCloseAction,
}: {
  open: boolean;
  onCloseAction: () => void;
}) {
  const t = useTranslations("admin.platform.settings");

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t("add-admin.title")}
      description={t("add-admin.description")}
    >
      <Form
        action={addAdmin}
        resolver={typeboxResolver(getAddAdminFormSchema())}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t("add-admin.title"),
        }}
        secureForm={false}
        toastMessages={{
          loading: t("add-admin.adding"),
          success: t("add-admin.added"),
        }}
      >
        <Admin />
      </Form>
    </FormSheet>
  );
}
