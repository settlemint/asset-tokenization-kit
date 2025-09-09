import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { Fingerprint, Wallet, Copy, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface UserIdentityInfoCardProps {
  user: User;
}

/**
 * Status indicator component for registration status
 */
function RegistrationStatusIndicator({ user }: { user: User }) {

  if (user.isRegistered) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Registered
        </span>
      </div>
    );
  }

  if (user.wallet) {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          Pending
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <XCircle className="h-4 w-4" />
      <span className="text-sm font-medium">
        Not Connected
      </span>
    </div>
  );
}

/**
 * Card component displaying user identity and blockchain information
 * 
 * Shows wallet address, on-chain identity, registration status,
 * and other blockchain-related user information.
 * Claims are excluded and will be shown on a separate tab.
 */
export function UserIdentityInfoCard({ user }: UserIdentityInfoCardProps) {

  const handleCopyIdentity = () => {
    if (user.identity) {
      void navigator.clipboard.writeText(user.identity);
      toast.success("Identity address copied to clipboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Identity Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Registration Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Registration Status
            </p>
            <RegistrationStatusIndicator user={user} />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Wallet Address
            </p>
            {user.wallet ? (
              <Web3Address
                address={user.wallet}
                size="small"
                showPrettyName={true}
                showBadge={true}
                copyToClipboard={true}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No wallet connected
              </p>
            )}
          </div>
        </div>

        {/* On-chain Identity */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Fingerprint className="h-4 w-4" />
              On-chain Identity
            </p>
            {user.identity ? (
              <div className="flex items-center gap-2">
                <Web3Address
                  address={user.identity}
                  size="small"
                  showPrettyName={true}
                  showBadge={false}
                  copyToClipboard={false}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyIdentity}
                  title="Copy identity address"
                  className="h-6 w-6"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No identity registered
              </p>
            )}
          </div>
        </div>

        {/* Identity Claims Count (without showing actual claims) */}
        {user.isRegistered && (
          <div className="border-t pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Claims
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {user.claims.length} {user.claims.length === 1 ? 'claim' : 'claims'}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    View on Claims tab
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help text for unregistered users */}
        {!user.isRegistered && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              {user.wallet 
                ? "User has connected wallet but identity registration is pending."
                : "User needs to connect a wallet to begin registration process."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}