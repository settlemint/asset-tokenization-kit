import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPushAirdropDetail } from "@/lib/queries/push-airdrop/push-airdrop-detail";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { getAddress } from "viem";

interface PageProps {
  params: {
    address: string;
    locale: string;
  };
}

export default async function PushAirdropRecipientsPage({
  params: { address, locale },
}: PageProps) {
  const t = useTranslations("airdrop");
  const airdrop = await getPushAirdropDetail({
    address: getAddress(address),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recipients.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("recipients.columns.recipient")}</TableHead>
              <TableHead>{t("recipients.columns.amount")}</TableHead>
              <TableHead>{t("recipients.columns.index")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {airdrop.distribution.map((recipient) => (
              <TableRow key={recipient.recipient}>
                <TableCell className="font-mono">
                  {recipient.recipient}
                </TableCell>
                <TableCell>
                  {formatNumber(recipient.amount, {
                    locale,
                    decimals: airdrop.asset.decimals,
                    token: airdrop.asset.symbol,
                  })}
                </TableCell>
                <TableCell>{recipient.index}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
