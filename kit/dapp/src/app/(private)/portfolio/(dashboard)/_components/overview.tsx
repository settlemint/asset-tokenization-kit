import { Greeting } from './greeting';
import { MyAssets } from './my-assets/my-assets';

export function PortfolioOverview() {
  return (
    <div>
      <div>
        <Greeting />
        <MyAssets />
      </div>
    </div>
  );
}
