import { getUser } from './_components/data';
import { UserDetails } from './_components/user-details';
import { UserDetailsClient } from './_components/user-details-client';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <UserDetails id={id} dataAction={getUser}>
      <UserDetailsClient id={id} refetchInterval={5000} />
    </UserDetails>
  );
}
