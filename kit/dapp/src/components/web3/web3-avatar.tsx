import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type VariantProps, cva } from "class-variance-authority";
import MD5 from "crypto-js/md5";
import { memo, useMemo } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const web3AvatarVariants = cva("rounded-full", {
  variants: {
    size: {
      tiny: "size-4",
      small: "size-8",
      medium: "size-10",
      big: "size-12",
      large: "size-16",
    },
    shape: {
      circle: "rounded-full",
      square: "rounded-lg",
    },
  },
  defaultVariants: {
    size: "small",
    shape: "circle",
  },
});

const sizeToPixels = {
  tiny: 16,
  small: 32,
  medium: 40,
  big: 48,
  large: 64,
} as const;

type AvatarSize = keyof typeof sizeToPixels;
type AvatarShape = "circle" | "square";

interface Web3AvatarProps extends VariantProps<typeof web3AvatarVariants> {
  /** Email address for Gravatar lookup */
  email?: string;
  /** Display name for alt text */
  name?: string;
  /** Ethereum address for Jazzicon generation */
  address?: string | null;
  /** Avatar size preset */
  size?: AvatarSize;
  /** Avatar shape */
  shape?: AvatarShape;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show loading skeleton */
  showSkeleton?: boolean;
  /** Custom fallback image URL */
  fallbackUrl?: string;
  /** Image load error handler */
  onError?: () => void;
  /** Image load success handler */
  onLoad?: () => void;
}

const GRAVATAR_BASE_URL = "https://www.gravatar.com/avatar/";
const GRAVATAR_DEFAULT = "404"; // Return 404 if no gravatar exists

// Simple in-memory cache for gravatar checks
const gravatarCache = new Map<
  string,
  { url: string | null; timestamp: number }
>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function checkGravatar(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Check cache first
  const cached = gravatarCache.get(normalizedEmail);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  const hash = MD5(normalizedEmail).toString();
  // Use 'blank' as default to avoid 404 errors in console
  const checkUrl = `${GRAVATAR_BASE_URL}${hash}?d=blank&s=200`;
  const finalUrl = `${GRAVATAR_BASE_URL}${hash}?d=${GRAVATAR_DEFAULT}&s=200`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000); // 3s timeout

  try {
    const response = await fetch(checkUrl, {
      method: "HEAD",
      signal: controller.signal,
    });

    // Check if the response is successful and not a blank/empty image
    const result =
      response.ok && response.headers.get("content-length") !== "0"
        ? finalUrl
        : null;

    // Cache the result
    gravatarCache.set(normalizedEmail, {
      url: result,
      timestamp: Date.now(),
    });

    return result;
  } catch {
    // Gravatar check failed, cache the failure
    gravatarCache.set(normalizedEmail, {
      url: null,
      timestamp: Date.now(),
    });

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getJazziconSeed(input: string): number {
  // For addresses, use the official jsNumberForAddress
  if (input.startsWith("0x") && input.length === 42) {
    return jsNumberForAddress(input);
  }

  // For email/name, use MD5 hash approach
  const hash = MD5(input.toLowerCase()).toString();
  // Convert first 8 chars of hash to number
  return Number.parseInt(hash.slice(0, 8), 16);
}

const Web3AvatarComponent = memo(function Web3Avatar({
  email,
  name,
  address,
  size = "small",
  shape = "circle",
  className,
  showSkeleton = true,
  fallbackUrl,
  onError,
  onLoad,
}: Web3AvatarProps) {
  const identifier = address ?? email ?? name ?? "";
  const pixelSize = sizeToPixels[size];
  const altText = name ?? email ?? address ?? "Avatar";

  const { data: gravatarUrl, isLoading } = useQuery({
    queryKey: ["gravatar", email],
    queryFn: async () => {
      if (!email) return null;
      return checkGravatar(email);
    },
    enabled: !!email,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: false,
    refetchOnMount: false,
  });

  const jazziconSeed = useMemo(() => {
    if (!identifier) return 0;
    return getJazziconSeed(identifier);
  }, [identifier]);

  // React Compiler will optimize these handlers
  const handleImageError = () => {
    onError?.();
  };

  const handleImageLoad = () => {
    onLoad?.();
  };

  // Determine border radius based on shape
  const shapeClass = shape === "square" ? "rounded-lg" : "rounded-full";

  // Show skeleton while checking gravatar (only if showSkeleton is true and we're actually loading)
  if (showSkeleton && isLoading && email) {
    return (
      <Skeleton
        className={cn(
          shapeClass,
          web3AvatarVariants({ size, shape }),
          className
        )}
      />
    );
  }

  // If no identifier, show placeholder
  if (!identifier) {
    return (
      <Avatar className={cn(web3AvatarVariants({ size, shape }), className)}>
        <AvatarFallback className="bg-muted">
          <div className="size-full" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // Determine the primary image source
  const primaryImageSrc = gravatarUrl ?? fallbackUrl;

  // If we have an image URL (gravatar or fallback), use it
  if (primaryImageSrc) {
    return (
      <Avatar className={cn(web3AvatarVariants({ size, shape }), className)}>
        <AvatarImage
          src={primaryImageSrc}
          alt={altText}
          className={shapeClass}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <AvatarFallback className="flex items-center justify-center p-0">
          <div className={cn("overflow-hidden", shapeClass)}>
            <Jazzicon diameter={pixelSize} seed={jazziconSeed} />
          </div>
        </AvatarFallback>
      </Avatar>
    );
  }

  // Otherwise, use Jazzicon as primary avatar
  return (
    <Avatar className={cn(web3AvatarVariants({ size, shape }), className)}>
      <AvatarFallback className="flex items-center justify-center p-0">
        <div className={cn("overflow-hidden", shapeClass)}>
          <Jazzicon diameter={pixelSize} seed={jazziconSeed} />
        </div>
      </AvatarFallback>
    </Avatar>
  );
});

Web3AvatarComponent.displayName = "Web3Avatar";

export { Web3AvatarComponent as Web3Avatar };
