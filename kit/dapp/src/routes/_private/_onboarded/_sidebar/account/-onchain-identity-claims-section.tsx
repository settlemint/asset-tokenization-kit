import { IssueClaimSheet } from "@/components/manage-dropdown/sheets/issue-claim-sheet";
import { ClaimsTable } from "@/components/participants/common/claims-table";
import { Button } from "@/components/ui/button";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

export function OnchainIdentityClaimsSection() {
  const { t } = useTranslation(["user", "identities"]);
  const [issueClaimOpen, setIssueClaimOpen] = useState(false);
  const identityQuery = useSuspenseQuery(
    orpc.system.identity.me.queryOptions({
      throwOnError: (error) => !isOrpcNotFoundError(error),
    })
  );

  const identityError = identityQuery.error;
  const identity = isOrpcNotFoundError(identityError)
    ? null
    : (identityQuery.data ?? null);

  const managedIdentity = useMemo<ManagedIdentity | null>(() => {
    if (!identity) {
      return null;
    }

    return {
      identity: identity.id,
      account: {
        id: identity.account.id,
        contractName: identity.account.contractName ?? null,
      },
      isRegistered:
        typeof identity.registered === "object" &&
        identity.registered.isRegistered,
    };
  }, [identity]);

  if (!managedIdentity) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("user:fields.noIdentityRegistered")}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            {t("identities:tabs.claims")}
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setIssueClaimOpen(true);
            }}
          >
            {t("identities:actions.issueClaim.title")}
          </Button>
        </div>
        <ClaimsTable identityAddress={managedIdentity.identity} />
      </div>
      <IssueClaimSheet
        open={issueClaimOpen}
        onOpenChange={setIssueClaimOpen}
        identity={managedIdentity}
      />
    </>
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
