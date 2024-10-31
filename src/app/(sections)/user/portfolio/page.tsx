import { auth } from "@/lib/auth/auth";
import type { Address } from "viem";
import { PortfolioTable } from "./_components/portfolio-table";

export default async function UserPortfolio() {
  const session = await auth();
  const address = session?.user.wallet;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
      </div>
      <PortfolioTable address={address as Address} />
    </>
  );
}
