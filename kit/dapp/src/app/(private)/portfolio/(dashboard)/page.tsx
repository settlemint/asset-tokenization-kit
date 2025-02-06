import { PortfolioOverview } from './_components/overview';
import { PortfolioTable } from './_components/table';

export default function PortfolioPage() {
  return (
    <div className="container space-y-8 py-8">
      <PortfolioOverview />
      <PortfolioTable />
    </div>
  );
}
