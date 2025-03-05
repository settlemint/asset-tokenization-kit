import { getUser } from "@/lib/auth/utils";
import { getPortfolioDashboardData } from "@/lib/queries/portfolio/portfolio-dashboard";
import type { Address } from "viem";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";

interface PortfolioDashboardProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export default async function PortfolioDashboard({
  params,
}: PortfolioDashboardProps) {
  const { locale } = await params;
  const user = await getUser(locale);
  const portfolioDashboardData = await getPortfolioDashboardData(
    user.wallet as Address
  );
  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <MyAssetsHeader data={portfolioDashboardData} />
      </div>
    </>
  );
}
