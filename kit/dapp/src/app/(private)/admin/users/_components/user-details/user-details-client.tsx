'use client';
import type { User } from '@/lib/auth/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { UserDetailsGrid } from './user-details-grid';
import { UserDetailsHeader } from './user-details-header';

export type UserDetailsClientProps = {
  dataAction: (id: string) => Promise<User>;
  id: string;
  refetchInterval?: number;
};

export function UserDetailsClient({ dataAction, id, refetchInterval }: UserDetailsClientProps) {
  const { data } = useSuspenseQuery<User>({
    queryKey: [`user-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="UserDetailsClient">
      <UserDetailsHeader data={data} />
      <UserDetailsGrid data={data} />
    </div>
  );
}
