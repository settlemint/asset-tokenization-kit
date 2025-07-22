import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SystemDeploy() {
  const { t } = useTranslation(["onboarding"]);
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();

  // Modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // System deployment mutation
  const { mutateAsync: createSystem, isPending: isCreatingSystem } =
    useMutation(
      orpc.system.create.mutationOptions({
        onSuccess: async () => {
          await refreshUserState();
          await completeStepAndNavigate(OnboardingStep.systemDeploy);
        },
      })
    );

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Initialize the system</h2>
          <p className="text-sm text-muted-foreground pt-2">
            You're about to set up the foundation of the platform
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
            <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-sm-state-warning">
                    This action will deploy blockchain smart contracts and
                    cannot be undone. Once deployed, the system will be
                    permanently active on the blockchain.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What gets deployed:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Core system smart contract</li>
                <li>• Identity Registry for user verification</li>
                <li>• Compliance Engine for regulatory requirements</li>
                <li>• Trusted Issuers Registry for authorized parties</li>
                <li>• Token Factory Registry for asset creation</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowVerificationModal(true);
                }}
                disabled={isCreatingSystem}
                className="flex-1"
              >
                {isCreatingSystem ? "Deploying..." : "Deploy System"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={({ pincode, otp }) => {
          // Determine which verification method was provided
          let verificationCode: string;
          let verificationType: "pincode" | "two-factor";

          if (pincode !== undefined) {
            verificationCode = pincode;
            verificationType = "pincode";
          } else if (otp !== undefined) {
            verificationCode = otp;
            verificationType = "two-factor";
          } else {
            throw new Error("No verification code provided");
          }

          if (!verificationCode) {
            throw new Error("Verification code cannot be empty");
          }

          toast.promise(
            createSystem({
              verification: {
                verificationCode,
                verificationType,
              },
            }),
            {
              loading: "Deploying system...",
              success: "System deployed successfully!",
              error: (error: Error) =>
                `Failed to deploy system: ${error.message}`,
            }
          );
        }}
        title="Confirm System Deployment"
        description="Please verify your identity to deploy the blockchain system."
      />
    </>
  );
}
