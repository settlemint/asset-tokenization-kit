import { RecoveryCodes } from "@/components/onboarding/recovery-codes/recovery-codes";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { authClient } from "@/lib/auth/auth.client";
import { createFileRoute } from "@tanstack/react-router";
import { defer } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-recovery-codes"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.walletRecoveryCodes),
  loader: () => {
    // Start generating recovery codes immediately
    const recoveryCodesPromise = authClient.secretCodes
      .generate({
        password: undefined,
      })
      .then((response) => {
        // The response structure from better-auth client is { data, error }
        if (response.error) {
          throw new Error(
            response.error.message || "Failed to generate recovery codes"
          );
        }
        return response;
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to generate recovery codes";
        // Return the error in a format we can handle
        return {
          data: null,
          error: {
            message: errorMessage,
          },
        };
      });

    // Return deferred promise for streaming
    return {
      recoveryCodesData: defer(recoveryCodesPromise),
    };
  },
  component: WalletRecoveryCodesComponent,
});

function WalletRecoveryCodesComponent() {
  return <RecoveryCodes />;
}
