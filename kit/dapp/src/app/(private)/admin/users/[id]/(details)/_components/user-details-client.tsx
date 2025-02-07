'use client';
import type { DetailUser } from '@/app/(private)/admin/users/[id]/(details)/_components/data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUser } from './data';
import { UserDetailsGrid } from './user-details-grid';
import { UserDetailsHeader } from './user-details-header';

export type UserDetailsClientProps = {
  id: string;
  refetchInterval?: number;
};

export function UserDetailsClient({ id, refetchInterval }: UserDetailsClientProps) {
  const { data, error } = useSuspenseQuery<DetailUser>({
    queryKey: [`user-${id}`],
    queryFn: () => getUser(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="UserDetailsClient">
      <UserDetailsHeader data={data} />
      <UserDetailsGrid data={data} />
    </div>
  );
}
