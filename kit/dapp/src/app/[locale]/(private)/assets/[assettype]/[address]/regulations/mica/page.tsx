import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function MicaCompliancePage({ params }: PageProps) {
  return <p>wow such empty</p>;
}
