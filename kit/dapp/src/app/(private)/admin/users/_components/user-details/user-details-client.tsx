'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { User } from '../data';
import { UserDetailsGrid } from './user-details-grid';
import { UserDetailsHeader } from './user-details-header';

export type UserDetailsClientProps = {
  dataAction: (id: string) => Promise<User>;
  id: string;
  refetchInterval?: number;
};

export function UserDetailsClient({ dataAction, id, refetchInterval }: UserDetailsClientProps) {
  const { data, error } = useSuspenseQuery<User>({
    queryKey: [`user-${id}`],
    queryFn: () => dataAction(id),
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
