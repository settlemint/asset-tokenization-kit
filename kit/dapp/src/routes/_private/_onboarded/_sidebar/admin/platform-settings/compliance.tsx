import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/compliance"
)({
  component: CompliancePage,
});

function CompliancePage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("settings.compliance")}</h1>
        <p className="text-muted-foreground mt-2">
          Manage compliance rules, KYC/AML settings, and regulatory
          requirements.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Compliance configuration coming soon...
        </p>
      </div>
    </div>
  );
}
