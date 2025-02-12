'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type HTMLAttributes, forwardRef, useEffect, useMemo, useState } from 'react';
import { getGravatarUrl } from 'react-awesome-gravatar';
import { http, type Address, createPublicClient, getAddress, isAddress } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * Type for valid Ethereum addresses
 */
type EthereumAddress = Address & { readonly __brand: unique symbol };

/**
 * Props for the AddressAvatar component.
 * @property {EthereumAddress | null} [address] - The Ethereum address to generate an avatar for.
 * @property {string | null} [email] - The email address to generate a Gravatar for.
 * @property {string | null} [imageUrl] - Direct URL for the avatar image.
 * @property {boolean} [indicator] - Whether to show an indicator on the avatar.
 * @property {'big' | 'small' | 'tiny'} [variant='big'] - The size variant of the avatar.
 */
interface AddressAvatarProps extends HTMLAttributes<HTMLDivElement> {
  address?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  indicator?: boolean;
  variant?: 'big' | 'small' | 'tiny';
  verbose?: boolean;
}

// Create a singleton viem client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://ethereum-rpc.publicnode.com'),
});

/**
 * Sizes for different avatar variants
 */
const AVATAR_SIZES = {
  big: 'h-10 w-10',
  small: 'h-6 w-6',
  tiny: 'h-4 w-4',
} as const;

/**
 * AddressAvatar component displays an avatar based on the provided address or email.
 * It shows a skeleton loader while the avatar is being fetched and fades in the actual image when loaded.
 *
 * @param {AddressAvatarProps} props - The component props.
 * @param {React.Ref<HTMLDivElement>} ref - The ref to be forwarded to the root element.
 * @returns {JSX.Element} The rendered AddressAvatar component.
 */
export const AddressAvatar = forwardRef<HTMLDivElement, AddressAvatarProps>(
  ({ address, email, imageUrl, className, indicator, variant = 'big', verbose = false, ...props }, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Validate address if provided
    const validAddress = useMemo(() => {
      if (!address) {
        return null;
      }
      return isAddress(address) ? (address as EthereumAddress) : null;
    }, [address]);

    const { data: avatar } = useSuspenseQuery({
      queryKey: [`avatar-${imageUrl ?? ''}-${address ?? ''}-${email ?? ''}-${validAddress ?? ''}`],
      queryFn: async () => {
        try {
          if (imageUrl) {
            return { avatar: imageUrl };
          }

          if (validAddress) {
            const ensName = await publicClient.getEnsName({
              address: validAddress,
            });

            if (ensName) {
              return { ensName, avatar: `https://metadata.ens.domains/mainnet/avatar/${ensName}` };
            }
          }

          const avatarUrl = getGravatarUrl(email ?? getAddress(address ?? '') ?? '', {
            default: 'identicon',
            size: 400,
          });

          return { avatar: avatarUrl };
        } catch {
          return { avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address ?? email ?? 'default'}` };
        }
      },
    });

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizeClass = AVATAR_SIZES[variant];

    return (
      <div className="relative">
        <Avatar
          ref={ref}
          className={cn(sizeClass, className)}
          {...props}
          aria-label={`Avatar for ${email ?? address ?? 'user'}`}
        >
          <AvatarFallback className={cn(sizeClass, className)}>
            <Skeleton
              className={cn('absolute inset-0 rounded-full', imageLoaded && !imageError ? 'opacity-0' : 'opacity-100')}
            />
          </AvatarFallback>
          <AvatarImage
            src={avatar.avatar}
            className={cn('transition-opacity duration-300', imageLoaded && !imageError ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        </Avatar>
        {indicator && isMounted && (
          <span className="-top-0.5 -right-0.5 absolute flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        )}
      </div>
    );
  }
);

AddressAvatar.displayName = 'AddressAvatar';
