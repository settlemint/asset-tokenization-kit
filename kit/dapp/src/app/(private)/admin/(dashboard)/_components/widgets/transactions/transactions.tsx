import { QueryWrapper } from '@/components/blocks/query-wrapper/query-wrapper';
import { getTransactionsWidgetData } from './data';
import { TransactionsWidgetClient } from './transactions-client';

export function TransactionsWidget() {
  return (
    <QueryWrapper
      queryKey={['TransactionsWidget', 'transactions']}
      queryFn={getTransactionsWidgetData}
      ClientComponent={TransactionsWidgetClient}
    />
  );
}
