import { Greeting } from "./_components/widgets/greeting";
import { MyAssetsHeader } from "./_components/widgets/my-assets-header";
export const dynamic = 'force-dynamic';

export default function PortfolioDashboard() {
  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <MyAssetsHeader />
      </div>
    </>
  );
}
