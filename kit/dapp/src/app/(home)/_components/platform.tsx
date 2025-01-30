import Image from 'next/image';
import { BentoCard, BentoGrid } from './bento-grid';
import Designer from './features/designer.jpg';
import LifeCycle from './features/lifecycle.jpg';
import OpenSource from './features/opensource.jpg';
import SDK from './features/sdk.jpg';
import Unlimited from './features/unlimited.jpg';

export function Platform() {
  return (
    <div>
      <BentoGrid className="lg:grid-rows-3">
        <BentoCard
          name="Unlimited financial assets"
          description="Issue as many assets as you want"
          href="/admin"
          cta="Start issuing now"
          background={<Image src={Unlimited} alt="Unlimited" />}
          className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4"
        />
        <BentoCard
          name="Asset Designer"
          description="Flexible asset design"
          href="/admin"
          cta="Start issuing now"
          background={<Image src={Designer} alt="Asset Designer" />}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
        />
        <BentoCard
          name="Complete asset lifecycle"
          description="From creation to redemption"
          href="/admin"
          cta="Get started"
          background={<Image src={LifeCycle} alt="Life Cycle" />}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4"
        />
        <BentoCard
          name="Open Source"
          description="Use it, fork it, or learn from it"
          href="https://github.com/settlemint/starterkit-asset-tokenization"
          cta="Check it out on GitHub"
          background={<Image src={OpenSource} alt="Open Source" />}
          className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-3"
        />
        <BentoCard
          name="Deeply integrated"
          description="Leveraging the SettleMint SDK"
          href="https://github.com/settlemint/sdk"
          cta="Learn more about the SDK"
          background={<Image src={SDK} alt="SDK" />}
          className="lg:col-start-3 lg:col-end-3 lg:row-start-3 lg:row-end-4"
        />
      </BentoGrid>
    </div>
  );
}
