"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { memo, useEffect, useState } from "react";

export const ThemeImage = memo(function ThemeImage({
  light,
  dark,
}: {
  light: string | StaticImageData;
  dark: string | StaticImageData;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before mounting, render both images with opacity-0
  if (!mounted) {
    return (
      <div className="relative w-full">
        <Image
          src={light}
          className="max-w-full opacity-0 shadow-lg"
          priority
          placeholder="blur"
          alt="Dashboard preview"
          width={1050}
          height={674}
          quality={75}
          unoptimized
        />
        <Image
          src={dark}
          className="absolute top-0 left-0 max-w-full opacity-0 shadow-lg"
          alt="Dashboard preview"
          priority
          placeholder="blur"
          width={1050}
          height={674}
          quality={75}
          unoptimized
        />
      </div>
    );
  }
  return (
    <div className="relative w-full">
      <Image
        src={light}
        className={cn(
          "max-w-full shadow-lg transition-opacity duration-300",
          resolvedTheme === "dark" ? "opacity-0" : "opacity-100"
        )}
        sizes="(max-width: 1050px) 100vw, 1050px"
        width={1050}
        height={674}
        quality={75}
        alt="Dashboard preview"
        unoptimized
      />
      <Image
        src={dark}
        className={cn(
          "absolute top-0 left-0 max-w-full shadow-lg transition-opacity duration-300",
          resolvedTheme === "dark" ? "opacity-100" : "opacity-0"
        )}
        sizes="(max-width: 1050px) 100vw, 1050px"
        width={1050}
        height={674}
        quality={75}
        alt="Dashboard preview"
        unoptimized
      />
    </div>
  );
});
