import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { zeroAddress } from "viem";

export function UserWalletCard() {
  const { t } = useTranslation(["user"]);
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t("wallet.userWallet")}</CardTitle>
        <CardDescription>{t("wallet.userWalletDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center">
        {user.wallet && user.wallet !== zeroAddress ? (
          <>
            <div className="rounded-lg bg-card text-card-foreground p-4 shadow-sm border mb-6">
              <QRCode
                value={user.wallet}
                size={200}
                level="H"
                fgColor="var(--foreground)"
                bgColor="var(--background)"
              />
            </div>
            <div className="w-full max-w-md">
              <Web3Address
                address={user.wallet}
                className="justify-center"
                truncate={false}
                showPrettyName={false}
              />
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            {t("fields.noWalletConnected")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
