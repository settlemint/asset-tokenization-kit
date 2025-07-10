import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface DeploymentDetailsProps {
  systemAddress?: string | null;
  systemDetails?: {
    id?: string;
    identityRegistry?: string;
    compliance?: string;
    trustedIssuersRegistry?: string;
    tokenFactoryRegistry?: string;
  } | null;
}

export function DeploymentDetails({
  systemAddress,
  systemDetails,
}: DeploymentDetailsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyAddress = useCallback((address: string, label: string) => {
    void navigator.clipboard.writeText(address);
    toast.success(`${label} address copied to clipboard!`);
  }, []);

  const handleCopySystemContract = useCallback(() => {
    handleCopyAddress(
      systemDetails?.id ?? systemAddress ?? "",
      "System Contract"
    );
  }, [handleCopyAddress, systemDetails?.id, systemAddress]);

  const handleCopyIdentityRegistry = useCallback(() => {
    if (systemDetails?.identityRegistry) {
      handleCopyAddress(systemDetails.identityRegistry, "Identity Registry");
    }
  }, [handleCopyAddress, systemDetails?.identityRegistry]);

  const handleCopyCompliance = useCallback(() => {
    if (systemDetails?.compliance) {
      handleCopyAddress(systemDetails.compliance, "Compliance Engine");
    }
  }, [handleCopyAddress, systemDetails?.compliance]);

  const handleCopyTrustedIssuers = useCallback(() => {
    if (systemDetails?.trustedIssuersRegistry) {
      handleCopyAddress(
        systemDetails.trustedIssuersRegistry,
        "Trusted Issuers Registry"
      );
    }
  }, [handleCopyAddress, systemDetails?.trustedIssuersRegistry]);

  const handleCopyTokenFactoryRegistry = useCallback(() => {
    if (systemDetails?.tokenFactoryRegistry) {
      handleCopyAddress(
        systemDetails.tokenFactoryRegistry,
        "Token Factory Registry"
      );
    }
  }, [handleCopyAddress, systemDetails?.tokenFactoryRegistry]);

  const toggleDetails = () => setShowDetails(!showDetails);

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
            <div className="flex items-center justify-between p-3 bg-background rounded border">
              <div>
                <p className="font-medium text-sm">System Contract</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {systemDetails?.id ?? systemAddress ?? ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySystemContract}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {/* Identity Registry */}
            {systemDetails?.identityRegistry && (
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <p className="font-medium text-sm">Identity Registry</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {systemDetails.identityRegistry}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyIdentityRegistry}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Compliance Engine */}
            {systemDetails?.compliance && (
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <p className="font-medium text-sm">Compliance Engine</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {systemDetails.compliance}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCompliance}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Trusted Issuers Registry */}
            {systemDetails?.trustedIssuersRegistry && (
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <p className="font-medium text-sm">
                    Trusted Issuers Registry
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {systemDetails.trustedIssuersRegistry}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTrustedIssuers}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Token Factory Registry */}
            {systemDetails?.tokenFactoryRegistry && (
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <p className="font-medium text-sm">Token Factory Registry</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {systemDetails.tokenFactoryRegistry}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTokenFactoryRegistry}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
