import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function CompliancePage({ params }: PageProps) {
  const { address } = await params;
}
