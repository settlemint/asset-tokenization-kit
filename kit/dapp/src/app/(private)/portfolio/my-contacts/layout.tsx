import { PageHeader } from '@/components/layout/page-header';
import type { PropsWithChildren } from 'react';

export default function ActivityLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <PageHeader title={<span className="mr-2">My Contacts</span>} />
      {children}
    </div>
  );
}
