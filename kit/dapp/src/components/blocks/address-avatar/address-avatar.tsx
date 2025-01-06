'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type HTMLAttributes, forwardRef, useState } from 'react';
import { getGravatarUrl } from 'react-awesome-gravatar';
import { type Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * Props for the AddressAvatar component.
 * @property {string | null} [address] - The Ethereum address to generate an avatar for.
 * @property {string | null} [email] - The email address to generate a Gravatar for.
 * @property {boolean} [badge] - Whether to show a badge on the avatar.
 * @property {'big' | 'small'} [variant='big'] - The size variant of the avatar.
 */
interface AddressAvatarProps extends HTMLAttributes<HTMLDivElement> {
  address?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  indicator?: boolean;
  variant?: 'big' | 'small' | 'tiny';
}

/**
 * AddressAvatar component displays an avatar based on the provided address or email.
 * It shows a skeleton loader while the avatar is being fetched and fades in the actual image when loaded.
 *
 * @param {AddressAvatarProps} props - The component props.
 * @param {React.Ref<HTMLDivElement>} ref - The ref to be forwarded to the root element.
 * @returns {JSX.Element} The rendered AddressAvatar component.
 */
export const AddressAvatar = forwardRef<HTMLDivElement, AddressAvatarProps>(
  ({ address, email, imageUrl, className, indicator, variant = 'big', ...props }, ref) => {
    const { data: avatar } = useSuspenseQuery({
      queryKey: ['avatar', email, address],
      queryFn: async () => {
        if (imageUrl) {
          return { avatar: imageUrl };
        }

        if (address) {
          const publicClient = createPublicClient({
            chain: mainnet,
            transport: http('https://ethereum-rpc.publicnode.com'),
          });

          const ensName = await publicClient.getEnsName({
            address: address as Address,
          });

          if (ensName) {
            return { ensName, avatar: `https://metadata.ens.domains/mainnet/avatar/${ensName}` };
          }
        }
        const avatarUrl = getGravatarUrl(email ?? address ?? '', {
          default: 'identicon',
          size: 400,
        });

        return { avatar: avatarUrl };
      },
    });

    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="relative">
        <Avatar
          ref={ref}
          className={cn(variant === 'big' ? 'h-10 w-10' : variant === 'small' ? 'h-6 w-6' : 'h-4 w-4', className)}
          {...props}
        >
          <AvatarFallback
            className={cn(variant === 'big' ? 'h-10 w-10' : variant === 'small' ? 'h-6 w-6' : 'h-4 w-4', className)}
          >
            <Skeleton className={cn('absolute inset-0 rounded-full', imageLoaded ? 'opacity-0' : 'opacity-100')} />
          </AvatarFallback>
          <AvatarImage
            src={avatar.avatar}
            className={cn('transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImageLoaded(true)}
          />
        </Avatar>
        {indicator && (
          <span className="-top-0.5 -right-0.5 absolute flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        )}
      </div>
    );
  }
);

AddressAvatar.displayName = 'AddressAvatar';
