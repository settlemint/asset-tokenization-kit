"use client";

import { useAvatar } from "@/components/hooks/use-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef, useState } from "react";

interface AvatarData {
  avatar: string | null;
}

interface ExtendedAvatarProps extends HTMLAttributes<HTMLDivElement> {
  address?: string | null;
  email?: string | null;
  badge?: boolean;
}

/**
 * ExtendedAvatar component displays an avatar based on the provided address or email.
 * It shows a skeleton loader while the avatar is being fetched and fades in the actual image when loaded.
 */
export const ExtendedAvatar = forwardRef<HTMLDivElement, ExtendedAvatarProps>(
  ({ address, email, className, badge, ...props }, ref) => {
    const avatar = useAvatar({ address, email }) as AvatarData | null;
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="relative">
        <Avatar ref={ref} className={cn("cursor-pointer relative w-10 h-10", className)} {...props}>
          <AvatarFallback>
            <Skeleton className={cn("rounded-full absolute inset-0", imageLoaded ? "opacity-0" : "opacity-100")} />
          </AvatarFallback>
          {avatar?.avatar && (
            <AvatarImage
              src={avatar.avatar}
              className={cn("transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </Avatar>
        {badge && (
          <span className="absolute -top-0.5 -right-0.5  flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
        )}
      </div>
    );
  },
);

ExtendedAvatar.displayName = "ExtendedAvatar";
