import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import {
  Tile,
  TileContent,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileTitle,
} from "@/components/tile/tile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { AlertTriangle, Shield } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type IdentityClaimsTileProps = {
  identity: Identity;
  onManageVerifications?: () => void;
};

export function IdentityClaimsTile({
  identity,
  onManageVerifications,
}: IdentityClaimsTileProps) {
  const { t } = useTranslation(["identities", "common"]);

  const identityAddress = identity.id;
  const claims = identity.claims ?? [];

  const claimStats = useMemo(() => {
    const activeClaims = claims.filter((claim) => !claim.revoked);
    const revokedClaims = claims.filter((claim) => claim.revoked);

    // For now, all claims are considered trusted since there's no trust verification in place
    const untrustedClaims = [];

    return {
      total: claims.length,
      active: activeClaims.length,
      revoked: revokedClaims.length,
      untrusted: untrustedClaims.length,
      hasUntrustedClaims: untrustedClaims.length > 0,
    };
  }, [claims]);

  return (
    <Tile>
      <TileHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Shield className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <TileTitle>{t("identities:claimsTile.title")}</TileTitle>
            <p className="text-sm font-medium text-muted-foreground">
              {t("identities:claimsTile.subtitle")}
            </p>
          </div>
        </div>
      </TileHeader>
      <TileContent className="gap-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("identities:fields.identityAddress")}
            </dt>
            <dd>
              <CopyToClipboard
                value={identityAddress}
                className="inline-flex w-full flex-wrap items-center gap-2"
              >
                <span
                  className="block w-full truncate rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground"
                  title={identityAddress}
                >
                  {identityAddress}
                </span>
              </CopyToClipboard>
            </dd>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {t("identities:claimsTile.activeVerifications")}
            </span>
            <p className="text-3xl font-semibold tracking-tight">
              {claimStats.active}
            </p>
          </div>

          {claimStats.hasUntrustedClaims && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                {t("identities:claimsTile.untrustedClaimsWarning", {
                  count: claimStats.untrusted,
                })}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </TileContent>
      <TileFooter>
        <TileFooterAction
          className="w-full"
          variant="outline"
          onClick={onManageVerifications}
          disabled={!onManageVerifications}
        >
          {t("identities:claimsTile.manageVerifications")}
        </TileFooterAction>
      </TileFooter>
    </Tile>
  );
}
