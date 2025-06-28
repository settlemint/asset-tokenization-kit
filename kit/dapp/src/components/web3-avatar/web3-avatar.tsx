import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import MD5 from "crypto-js/md5";
import { memo, useMemo } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

interface Web3AvatarProps {
  email?: string;
  name?: string;
  address?: string;
  size?: number;
  className?: string;
}

const GRAVATAR_BASE_URL = "https://www.gravatar.com/avatar/";
const GRAVATAR_DEFAULT = "404"; // Return 404 if no gravatar exists

async function checkGravatar(email: string): Promise<string | null> {
  const hash = MD5(email.trim().toLowerCase()).toString();
  const url = `${GRAVATAR_BASE_URL}${hash}?d=${GRAVATAR_DEFAULT}&s=200`;

  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url;
    }
  } catch {
    // Gravatar check failed, return null
  }

  return null;
}

function getJazziconSeed(input: string): number {
  // For addresses, use the official jsNumberForAddress
  if (input.startsWith("0x") && input.length === 42) {
    return jsNumberForAddress(input);
  }

  // For email/name, use MD5 hash approach
  const hash = MD5(input.toLowerCase()).toString();
  // Convert first 8 chars of hash to number
  return parseInt(hash.slice(0, 8), 16);
}

const Web3AvatarComponent = memo(function Web3Avatar({
  email,
  name,
  address,
  size = 40,
  className = "",
}: Web3AvatarProps) {
  const identifier = address ?? email ?? name ?? "";

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
  });

  const jazziconSeed = useMemo(() => {
    if (!identifier) return 0;
    return getJazziconSeed(identifier);
  }, [identifier]);

  const avatarStyle = useMemo(() => ({ width: size, height: size }), [size]);

  // Show skeleton while checking gravatar or if no identifier
  if (isLoading || !identifier) {
    return (
      <Skeleton className={`rounded-full ${className}`} style={avatarStyle} />
    );
  }

  // If we have a gravatar URL, use it
  if (gravatarUrl) {
    return (
      <Avatar className={className} style={avatarStyle}>
        <AvatarImage 
          src={gravatarUrl} 
          alt={name ?? email ?? "User avatar"} 
        />
        <AvatarFallback className="flex items-center justify-center">
          <Jazzicon diameter={size} seed={jazziconSeed} />
        </AvatarFallback>
      </Avatar>
    );
  }

  // Otherwise, use Jazzicon as primary avatar
  return (
    <Avatar className={className} style={avatarStyle}>
      <AvatarFallback className="flex items-center justify-center">
        <Jazzicon diameter={size} seed={jazziconSeed} />
      </AvatarFallback>
    </Avatar>
  );
});

Web3AvatarComponent.displayName = "Web3Avatar";

export { Web3AvatarComponent as Web3Avatar };
