import { Greeting } from "./_components/widgets/greeting";

export const dynamic = 'force-dynamic';

export default function PortfolioDashboard() {
  return (
    <>
      <div className="space-y-4">
        <Greeting />

      </div>
    </>
  );
}
