import { Button } from '@/components/ui/button';
import { ArrowUpFromLine } from 'lucide-react';
import { Greeting } from './greeting';

export function PortfolioOverview() {
  return (
    <div>
      <div>
        <Greeting />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="mr-1 font-bold text-4xl">4000</span>
            <span>assets</span>
          </div>
          <Button className="w-1/6">
            <ArrowUpFromLine /> Transfer
          </Button>
        </div>
      </div>
    </div>
  );
}
