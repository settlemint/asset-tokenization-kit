import { TileDetailLayout } from "@/components/layout/tile-detail-layout";
import { IssueClaimSheet } from "@/components/manage-dropdown/sheets/issue-claim-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";
import { ClaimsTable } from "./claims-table";

export interface VerificationDetailViewProps {
  identityAddress: Address;
  displayName: string;
}

export function VerificationDetailView({
  identityAddress,
  displayName,
}: VerificationDetailViewProps) {
  const { t } = useTranslation(["identities", "common"]);
  const [isIssueClaimSheetOpen, setIsIssueClaimSheetOpen] = useState(false);

  // Fetch system permissions to determine available identity actions
  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Fetch identity data for the ManagedIdentity interface
  const { data: identityData } = useQuery(
    orpc.system.identity.readById.queryOptions({
      input: { identityId: identityAddress },
    })
  );

  const canAddClaim = Boolean(system?.userPermissions?.actions?.claimCreate);

  const managedIdentity: ManagedIdentity | undefined = identityData
    ? {
        identity: identityAddress,
        account: {
          id: identityData.account.id,
          contractName: identityData.account.contractName ?? null,
        },
        isRegistered: Boolean(identityData.registered),
      }
    : undefined;

  return (
    <TileDetailLayout
      title={t("identities:verificationDetail.title")}
      subtitle={displayName}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">
              {t("identities:verificationDetail.title")}
            </CardTitle>
            {canAddClaim && managedIdentity ? (
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsIssueClaimSheetOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("identities:verificationDetail.addClaim")}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ClaimsTable identityAddress={identityAddress} />
        </CardContent>
      </Card>

      {canAddClaim && managedIdentity ? (
        <IssueClaimSheet
          open={isIssueClaimSheetOpen}
          onOpenChange={setIsIssueClaimSheetOpen}
          identity={managedIdentity}
        />
      ) : null}
    </TileDetailLayout>
  );
}

interface ManagedIdentityAccount {
  id: string;
  contractName: string | null;
}

interface ManagedIdentity {
  identity: Address;
  account: ManagedIdentityAccount;
  isRegistered: boolean;
}
