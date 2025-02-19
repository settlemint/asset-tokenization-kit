'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryKeys } from '@/hooks/use-query-keys';
import { useQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';

interface AddressAvatarProps {
  address?: Address;
  imageUrl?: string | null;
  email?: string;
  variant?: 'tiny' | 'small' | 'big';
  className?: string;
  indicator?: boolean;
}

export function AddressAvatar({
  address,
  imageUrl,
  email,
  variant = 'small',
  className,
  indicator,
}: AddressAvatarProps) {
  const validAddress = address ? getAddress(address) : undefined;
  const { keys } = useQueryKeys();

  const { data: avatarUrl } = useQuery({
    queryKey: keys.users.avatar(validAddress, imageUrl, email),
    queryFn: () => {
      if (imageUrl) {
        return imageUrl;
      }
      if (email) {
        return `https://www.gravatar.com/avatar/${email}?d=mp`;
      }
      if (validAddress) {
        return `https://effigy.im/a/${validAddress}.svg`;
      }
      return null;
    },
  });

  const size = variant === 'tiny' ? 'h-4 w-4' : variant === 'small' ? 'h-8 w-8' : 'h-12 w-12';

  return (
    <div className="relative">
      <Avatar className={`${size} ${className ?? ''}`}>
        <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" />
        <AvatarFallback>
          {email?.slice(0, 2).toUpperCase() ?? validAddress?.slice(2, 4).toUpperCase() ?? '??'}
        </AvatarFallback>
      </Avatar>
      {indicator && (
        <span className="-top-0.5 -right-0.5 absolute flex h-3 w-3" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </span>
      )}
    </div>
  );
}
