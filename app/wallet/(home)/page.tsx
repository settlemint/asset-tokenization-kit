import { WalletDashboardPage } from "@/components/secure/wallet-dashboard-page";

export default function WalletHome({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return <WalletDashboardPage searchParams={searchParams} />;
}
