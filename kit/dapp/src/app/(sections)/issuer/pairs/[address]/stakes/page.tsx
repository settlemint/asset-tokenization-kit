"use client";

import { useParams } from "next/navigation";
import { StakesTable } from "./_components/stakes-table";

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <div className="WalletTokenDetailPage">
      <h3 className="text-lg font-semibold text-primary">Stakes</h3>
      <StakesTable address={address} />
    </div>
  );
}
