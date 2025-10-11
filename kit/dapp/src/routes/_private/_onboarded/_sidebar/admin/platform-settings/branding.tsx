import { BrandingForm } from "@/components/branding/branding-form";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/branding"
)({
  component: BrandingPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/admin/platform-settings/branding",
        }),
        createI18nBreadcrumbMetadata("settings.branding.title"),
      ],
    };
  },
});

function BrandingPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />

      <div className="mb-8 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t("settings.branding.title")}</h1>
        </div>
        <p className="text-muted-foreground">
          {t("settings.branding.description")}
        </p>
      </div>

      <BrandingForm />
    </div>
  );
}
