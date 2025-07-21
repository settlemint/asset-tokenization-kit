import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { useSettings } from "@/hooks/use-settings";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useState } from "react";

export function DeploymentDetails() {
  const [showDetails, setShowDetails] = useState(false);
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  // Query system details
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  if (!systemAddress || !systemDetails) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={toggleDetails}
        className="w-full justify-between"
      >
        <span>View Deployment Details</span>
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showDetails && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-foreground mb-3">
            Deployed Contract Addresses
          </h4>

          <div className="space-y-3">
            {/* System Contract */}
            <div className="p-3 bg-background rounded border">
              <p className="font-medium text-sm mb-1">System Contract</p>
              <Web3Address
                address={systemAddress as EthereumAddress}
                copyToClipboard
                showFullAddress={false}
                showBadge={false}
                size="small"
                className="text-xs text-muted-foreground"
              />
            </div>

            {/* Identity Registry */}
            {systemDetails.identityRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">Identity Registry</p>
                <Web3Address
                  address={systemDetails.identityRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Compliance Engine */}
            {systemDetails.compliance && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">Compliance Engine</p>
                <Web3Address
                  address={systemDetails.compliance}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Trusted Issuers Registry */}
            {systemDetails.trustedIssuersRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  Trusted Issuers Registry
                </p>
                <Web3Address
                  address={systemDetails.trustedIssuersRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Token Factory Registry */}
            {systemDetails.tokenFactoryRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  Token Factory Registry
                </p>
                <Web3Address
                  address={systemDetails.tokenFactoryRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
