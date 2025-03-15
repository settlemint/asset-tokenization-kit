"use client";

import { CreateApiKeyForm } from "@/components/blocks/api-key/create-api-key-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string | null;
  createdAt: Date;
  lastRequest: Date | null;
  expiresAt: Date | null;
  userId: string;
  enabled: boolean;
}

export default function ApiKeysPage() {
  const t = useTranslations("portfolio.settings.api-keys");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Fetch API keys on component mount
  useEffect(() => {
    void fetchApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await authClient.apiKey.list();
      if (response.data) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      toast.error(t("fetch-error"));
    }
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        section={t("portfolio-management")}
        button={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            {t("create-api-key")}
          </Button>
        }
      />

      <CreateApiKeyForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchApiKeys}
      />

      <ul className="mt-6 space-y-4">
        {apiKeys?.map((apiKey) => (
          <li
            key={apiKey.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <div className="font-medium">{apiKey.name}</div>
              <div className="text-sm text-muted-foreground">
                {t("created-at")}: {apiKey.createdAt.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("last-used")}:{" "}
                {apiKey.lastRequest
                  ? apiKey.lastRequest.toLocaleString()
                  : t("never")}
              </div>
              {apiKey.expiresAt && (
                <div className="text-sm text-muted-foreground">
                  {t("expires-at")}: {apiKey.expiresAt.toLocaleString()}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
