"use client";

import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

/**
 * Branding Context
 *
 * Provides branding configuration to all components that need it.
 * Allows components to access custom logos, colors, and application title.
 */

interface BrandingContextValue {
  applicationTitle?: string | null;
  logoMain?: string | null;
  logoSidebar?: string | null;
  logoFavicon?: string | null;
  backgroundLight?: string | null;
  backgroundDark?: string | null;
  isLoading: boolean;
}

const BrandingContext = React.createContext<BrandingContextValue>({
  isLoading: true,
});

export function useBranding() {
  return React.useContext(BrandingContext);
}

export function BrandingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: branding, isLoading } = useQuery({
    ...orpc.branding.read.queryOptions(),
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const value = React.useMemo<BrandingContextValue>(
    () => ({
      applicationTitle: branding?.applicationTitle,
      logoMain: branding?.logoMain,
      logoSidebar: branding?.logoSidebar,
      logoFavicon: branding?.logoFavicon,
      backgroundLight: branding?.backgroundLight,
      backgroundDark: branding?.backgroundDark,
      isLoading,
    }),
    [branding, isLoading]
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}
