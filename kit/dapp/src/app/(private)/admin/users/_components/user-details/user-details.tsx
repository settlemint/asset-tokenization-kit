import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import type { User } from '../data';
import { UserDetailsTabs } from './user-details-tab';

export type UserDetailsProps = {
  id: string;
  children?: ReactNode;
  dataAction: (id: string) => Promise<User>;
};

export async function UserDetails({ id, children, dataAction }: UserDetailsProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`user-${id}`],
    queryFn: () => dataAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetailsTabs id={id}>
        <Suspense>
          <div className="UserDetails">{children}</div>
        </Suspense>
      </UserDetailsTabs>
    </HydrationBoundary>
  );
}
