import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { Web3Address } from "@/components/web3/web3-address";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/wallet"
)({
  component: Wallet,
});

function Wallet() {
  const { t } = useTranslation(["user", "common"]);
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl font-bold">{t("wallet.title")}</h1>
        <p className="text-muted-foreground">{t("wallet.description")}</p>
      </div>

      <div className="grid gap-6">
        {user.wallet ? (
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{t("wallet.userWallet")}</CardTitle>
              <CardDescription>
                {t("wallet.userWalletDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center gap-6">
              <div className="rounded-lg bg-white p-4 shadow-sm border">
                <QRCode
                  value={user.wallet}
                  size={200}
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="w-full max-w-md">
                <Web3Address
                  address={user.wallet}
                  showFullAddress={true}
                  copyToClipboard={true}
                  showPrettyName={false}
                  className="justify-center"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{t("wallet.userWallet")}</CardTitle>
              <CardDescription>
                {t("wallet.userWalletDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">
                {t("fields.noWalletConnected")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
