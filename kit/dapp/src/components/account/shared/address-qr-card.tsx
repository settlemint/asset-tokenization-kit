"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { cn } from "@/lib/utils";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import QRCode from "react-qr-code";

interface AddressQrCardProps {
  title: string;
  description?: string;
  address: Identity["id"] | null;
  emptyMessage: string;
  className?: string;
  contentClassName?: string;
  qrWrapperClassName?: string;
  addressContainerClassName?: string;
  addressClassName?: string;
  showPrettyName?: boolean;
  truncate?: boolean;
  qrSize?: number;
  qrLevel?: "L" | "M" | "Q" | "H";
}

export function AddressQrCard({
  title,
  description,
  address,
  emptyMessage,
  className,
  contentClassName,
  qrWrapperClassName,
  addressContainerClassName,
  addressClassName,
  showPrettyName = false,
  truncate = false,
  qrSize = 200,
  qrLevel = "H",
}: AddressQrCardProps) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-6",
          contentClassName
        )}
      >
        {address ? (
          <>
            <div
              className={cn(
                "rounded-lg border bg-white p-4 shadow-sm dark:bg-card",
                qrWrapperClassName
              )}
            >
              <QRCode
                value={address}
                size={qrSize}
                level={qrLevel}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <div className={cn("w-full max-w-md", addressContainerClassName)}>
              <Web3Address
                address={address}
                className={cn("justify-center", addressClassName)}
                showPrettyName={showPrettyName}
                truncate={truncate}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
