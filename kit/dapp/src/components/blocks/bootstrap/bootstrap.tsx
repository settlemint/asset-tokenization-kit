"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/lib/orpc/orpc";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import type { PropsWithChildren } from "react";

/**
 * Bootstrap Modal Client Component
 *
 * This component displays a non-dismissible modal when the system
 * is not properly configured.
 */
export function Bootstrap({ children }: PropsWithChildren) {
  const {
    data: systemAddressSetting,
    error: systemAddressSettingError,
    isLoading,
  } = useQuery(
    orpc.settings.read.queryOptions({
      input: { key: "SYSTEM_ADDRESS" },
    })
  );

  if (isLoading) {
    return null;
  }

  if (
    !systemAddressSettingError &&
    systemAddressSetting?.value &&
    systemAddressSetting.value.trim() !== ""
  ) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Render children in background (but make them non-interactive) */}
      <div className="pointer-events-none opacity-50">{children}</div>

      {/* Non-dismissible modal overlay */}
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-500" />
              System Configuration Required
            </DialogTitle>
            <DialogDescription>
              The system address has not been configured yet. Please contact
              your administrator to complete the initial system setup before you
              can use the application.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-md bg-amber-50 p-4 border border-amber-200">
            <div className="flex items-start">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Setup Required
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    The system needs to be configured with a valid system
                    address before it can be used. This is a one-time setup
                    process that must be completed by an administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
