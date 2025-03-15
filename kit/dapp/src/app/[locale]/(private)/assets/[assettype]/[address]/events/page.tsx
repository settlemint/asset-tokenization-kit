import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
	params: Promise<{ locale: Locale; address: Address }>;
}

export default async function EventsPage({ params }: PageProps) {
	const { address } = await params;

	return <AssetEventsTable asset={address} />;
}
