import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import type { Address } from "viem";

interface UserWalletCardProps {
  address: Address | null;
}

export function UserWalletCard({ address }: UserWalletCardProps) {
  const { t } = useTranslation(["user"]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t("wallet.userWallet")}</CardTitle>
        <CardDescription>{t("wallet.userWalletDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center">
        {address ? (
          <>
            <div className="rounded-lg bg-white p-4 shadow-sm border mb-6">
              <QRCode
                value={address}
                size={200}
                level="H"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <div className="w-full max-w-md">
              <Web3Address
                address={address}
                showFullAddress={true}
                copyToClipboard={true}
                showPrettyName={false}
                className="justify-center"
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
