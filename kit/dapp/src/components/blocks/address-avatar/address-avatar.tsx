"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { getGravatarUrl } from "react-awesome-gravatar";
import { getAddress, isAddress, type Address } from "viem";

/**
 * Avatar component variant styles using class-variance-authority
 */
const addressAvatarVariants = cva("", {
  variants: {
    size: {
      tiny: "h-4 w-4",
      small: "h-8 w-8",
      big: "h-12 w-12",
    },
    indicator: {
      true: "relative",
      false: "relative", // Both use relative for consistency
    },
  },
  defaultVariants: {
    size: "small",
    indicator: false,
  },
});

/**
 * Indicator variant styles for the animation dot
 */
const indicatorVariants = cva("-top-0.5 -right-0.5 absolute flex h-3 w-3", {
  variants: {
    color: {
      primary: "", // Uses primary color in Tailwind config
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

/**
 * Props for the AddressAvatar component
 */
export interface AddressAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof addressAvatarVariants> {
  /** Ethereum address to generate avatar for */
  address?: Address;
  /** Optional custom image URL */
  imageUrl?: string | null;
  /** Optional email address to generate Gravatar from */
  email?: string;
  /** Size variant */
  size?: "tiny" | "small" | "big";
  /** Whether to show an indicator dot */
  indicator?: boolean;
  /** Color of the indicator dot */
  indicatorColor?: "primary" | "success" | "warning" | "destructive";
  /** Accessibility label, defaults to translated "Avatar" text */
  alt?: string;
}

// Helper function to generate Gravatar URL
const generateGravatarUrl = (
  identifier: string,
  size: "tiny" | "small" | "big"
): string => {
  return getGravatarUrl(identifier, {
    default: "identicon",
    size: size === "tiny" ? 200 : 400,
  });
};

/**
 * Avatar component that displays an image based on an Ethereum address, email, or custom URL.
 * Falls back to address-based or email-based identicon if no image is provided.
 */
function AddressAvatarComponent({
  address,
  imageUrl,
  email,
  size = "small",
  indicator = false,
  indicatorColor = "primary",
  alt,
  className,
  ...props
}: AddressAvatarProps) {
  const t = useTranslations("components.address-avatar");

  // Use either size or variant prop (for backward compatibility)
  const sizeValue = size || "small";

  // Ensure address is properly checksummed
  const validAddress = useMemo(
    () => (address && isAddress(address) ? getAddress(address) : undefined),
    [address]
  );

  // Determine the identifier for Gravatar (email or address)
  const gravatarIdentifier = useMemo(
    () => email ?? address ?? "anonymous",
    [email, address]
  );

  // Calculate avatar source with fallbacks
  const avatarSrc = useMemo(() => {
    if (imageUrl) return imageUrl;

    // Generate the Gravatar URL
    return generateGravatarUrl(gravatarIdentifier, sizeValue);
  }, [imageUrl, gravatarIdentifier, sizeValue]);

  // Calculate fallback text (first 2 chars of email or address)
  const fallbackText = useMemo(() => {
    if (email) return email.slice(0, 2).toUpperCase();
    if (validAddress) return validAddress.slice(2, 4).toUpperCase();
    return "??";
  }, [email, validAddress]);

  // Use the provided alt text or the translated default
  const altText = alt || t("avatar");

  return (
    <div
      className={cn(
        addressAvatarVariants({ size: sizeValue, indicator }),
        className
      )}
      {...props}
    >
      <Avatar
        className={addressAvatarVariants({ size: sizeValue })}
        aria-label={altText}
      >
        <AvatarImage
          src={avatarSrc}
          alt={altText}
          loading="lazy"
          className="border-1 border-accent-foreground rounded-full"
        />
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>

      {indicator && (
        <span
          className={cn(indicatorVariants({ color: indicatorColor }))}
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
        </span>
      )}
    </div>
  );
}

// Add display name
AddressAvatarComponent.displayName = "AddressAvatarComponent";

// Export a memoized version of the component to prevent unnecessary re-renders
export const AddressAvatar = memo(AddressAvatarComponent);
AddressAvatar.displayName = "AddressAvatar";
