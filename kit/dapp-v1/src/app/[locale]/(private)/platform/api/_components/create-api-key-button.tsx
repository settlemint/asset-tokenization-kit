"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateApiKeyForm } from "./create-api-key-form";

export function CreateApiKeyButton() {
  const t = useTranslations("portfolio.settings.api-keys");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSuccess = async () => {
    // The page will automatically refresh since it's a server component
  };

  return (
    <>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        {t("create-api-key")}
      </Button>
      <CreateApiKeyForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
