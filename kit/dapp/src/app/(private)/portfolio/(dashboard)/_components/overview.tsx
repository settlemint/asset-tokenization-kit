import { Greeting } from './greeting';
import { MyAssets } from './my-assets/my-assets';

export function PortfolioOverview() {
  return (
    <div className="space-y-4">
      <Greeting />
      <MyAssets />
    </div>
  );
}
