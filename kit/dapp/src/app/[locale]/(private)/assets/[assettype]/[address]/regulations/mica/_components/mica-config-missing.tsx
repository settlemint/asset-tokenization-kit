"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";

interface MicaConfigMissingProps {
  assetAddress: Address;
}

export function MicaConfigMissing({ assetAddress }: MicaConfigMissingProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConfig = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(
        `/api/regulations/mica/${assetAddress}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create MiCA config: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("MiCA config created:", result);

      toast.success("MiCA regulation configuration created successfully!");

      // Refresh the page to show the regulation dashboard
      window.location.reload();
    } catch (error) {
      console.error("Error creating MiCA config:", error);
      toast.error(
        "Failed to create MiCA regulation configuration. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>MiCA Configuration Missing</CardTitle>
          <CardDescription>
            This asset doesn&apos;t have a MiCA regulation configuration yet.
            This is required to view the MiCA compliance dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Asset Address:{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {assetAddress}
            </code>
          </p>
          <Button
            onClick={handleCreateConfig}
            disabled={isCreating}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating
              ? "Creating Configuration..."
              : "Create MiCA Configuration"}
          </Button>
          <p className="text-xs text-muted-foreground">
            This will create a default MiCA regulation configuration that you
            can then customize.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
