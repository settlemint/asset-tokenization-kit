import { RecoveryCodesCard } from "@/components/account/wallet/recovery-codes-card";
import { UserWalletCard } from "@/components/account/wallet/user-wallet-card";
import { VerificationFactorsCard } from "@/components/account/wallet/verification-factors-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/wallet"
)({
  component: Wallet,
});

function Wallet() {
  const { t } = useTranslation(["user", "common", "onboarding"]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl font-bold">{t("wallet.title")}</h1>
        <p className="text-muted-foreground">{t("wallet.description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserWalletCard />

        <VerificationFactorsCard />

        <RecoveryCodesCard />
      </div>
    </div>
  );
}
