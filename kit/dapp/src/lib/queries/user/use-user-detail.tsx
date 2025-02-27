import { useEffect, useState } from 'react';
import { getOptionalUserDetail, type UserDetailProps } from './user-detail';

export function useOptionalUserDetail({ id }: UserDetailProps) {
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof getOptionalUserDetail>
  > | null>(null);

  useEffect(() => {
    getOptionalUserDetail({ id })
      .then(setUser)
      .catch(() => setUser(null));
  }, [id]);

  return user;
}
