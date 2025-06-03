import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{
    locale: Locale;
    address: Address;
  }>;
}

export default async function AirdropDetailsPage({ params }: PageProps) {
  const { address, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.airdrops.details",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 font-semibold text-lg">Airdrop Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contract Address:</span>
            <span className="font-mono">{address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>Standard Airdrop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-green-600">Active</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold text-lg">Distribution Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Recipients:</span>
            <span>Loading...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Claimed:</span>
            <span>Loading...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining:</span>
            <span>Loading...</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold text-lg">Timeline</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Time:</span>
            <span>Loading...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Time:</span>
            <span>Loading...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
