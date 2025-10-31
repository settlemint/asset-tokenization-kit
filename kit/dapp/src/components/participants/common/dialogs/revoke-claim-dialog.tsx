import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Address } from "viem";
import type { ClaimRow } from "../claims-table";

interface RevokeClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: ClaimRow;
  identityAddress: Address;
}

export function RevokeClaimDialog({
  open,
  onOpenChange,
  claim,
  identityAddress,
}: RevokeClaimDialogProps) {
  const { t } = useTranslation("identities");
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const identityQuery = orpc.system.identity.read.queryOptions({
    input: { identityId: identityAddress },
  });

  const resolveErrorMessage = (mutationError: unknown) =>
    mutationError instanceof Error
      ? mutationError.message
      : t("claimsTable.actions.revokeError");

  const revokeMutation = useMutation(
    orpc.system.identity.claims.revoke.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: identityQuery.queryKey,
        });
        setError(null);
        onOpenChange(false);
      },
      onError: (mutationError) => {
        setError(resolveErrorMessage(mutationError));
      },
    })
  );

  const handleSubmit = (verification: UserVerification) => {
    setError(null);
    toast.promise(
      revokeMutation.mutateAsync({
        targetIdentityAddress: identityAddress,
        claimTopic: claim.name,
        walletVerification: verification,
      }),
      {
        loading: t("claimsTable.actions.revokeLoading"),
        success: t("claimsTable.actions.success.revoke"),
        error: (mutationError) => resolveErrorMessage(mutationError),
      }
    );
  };

  const handleCancel = () => {
    setError(null);
    revokeMutation.reset();
  };

  return (
    <>
      <VerificationDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t("claimsTable.actions.revokeTitle")}
        description={t("claimsTable.actions.revokeDescription")}
        errorMessage={error}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
}
