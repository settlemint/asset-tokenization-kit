import { VerificationDialog } from "@/components/ui/verification-dialog";
import { authClient } from "@/lib/auth/auth.client";
import { Info, TriangleAlert } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Create ONCHAIN ID Step Component
 *
 * Allows users to create their ONCHAIN ID with PIN verification,
 * progress tracking, and success confirmation.
 */
export const CreateOnchainIdComponent = memo(function CreateOnchainIdComponent({
  onNext,
  onPrevious,
  isFirstStep,
}: {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const { data: session } = authClient.useSession();

  // State management
  const [currentScreen, setCurrentScreen] = useState<
    "initial" | "progress" | "success"
  >("initial");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [onchainIdAddress, setOnchainIdAddress] = useState<string | null>(null);

  // Check if user has 2FA enabled to determine available verification methods
  const hasTwoFactor = session?.user?.twoFactorEnabled ?? false;
  const hasPincode = session?.user?.pincodeEnabled ?? false;

  // Handle deploy button click
  const handleCreate = useCallback(() => {
    setVerificationError(null);
    setShowVerificationModal(true);
  }, []);

  // Handle verification submission
  const handleVerificationSubmit = useCallback(
    (
      _verificationCode: string,
      _verificationType: "pincode" | "two-factor"
    ) => {
      // Start the creation process
      setIsCreating(true);
      setShowVerificationModal(false);
      setCurrentScreen("progress");

      // Simulate ONCHAIN ID creation (replace with actual implementation)
      setTimeout(() => {
        // Simulate success with mock address
        setOnchainIdAddress("0x1234567890123456789012345678901234567890");
        setIsCreating(false);
        setCurrentScreen("success");
        toast.success("ONCHAIN ID created successfully!");
      }, 3000);
    },
    []
  );

  // Create stable callback references for verification dialog
  const handlePincodeSubmit = useCallback(
    (pincode: string) => {
      handleVerificationSubmit(pincode, "pincode");
    },
    [handleVerificationSubmit]
  );

  const handleOtpSubmit = useCallback(
    (otp: string) => {
      handleVerificationSubmit(otp, "two-factor");
    },
    [handleVerificationSubmit]
  );

  // Handle continue after success
  const handleContinue = useCallback(() => {
    onNext?.();
  }, [onNext]);

  // Render initial screen
  const renderInitialScreen = () => (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Your On-Chain Identity</h2>
        <p className="text-muted-foreground">
          Connect your verified identity to your wallet
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm">
          Your wallet proves that you control access to your assets, but it
          doesn't prove who you are.
        </p>

        <p className="text-sm">
          ONCHAINID is your on-chain identity, securely linked to your wallet.
          It holds verified information such as your name, country, or KYC
          status, which are added by trusted sources. These verifications are
          called "claims" and help the platform meet compliance requirements and
          protect users.
        </p>

        <p className="text-sm">
          Think of it as your digital passport for the blockchain: unique,
          verifiable, and fully under your control.
        </p>

        <p className="text-sm">
          Creating your ONCHAINID is quick and happens directly on-chain. You
          can update or complete your identity at any time from your dashboard.
        </p>
      </div>

      {/* Warning box */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              This process may take up to 2–3 minutes depending on your
              selections.
            </p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              You'll be asked to confirm each transaction using your PIN or OTP.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          >
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={handleCreate}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create My ONCHAINID
        </button>
      </div>
    </div>
  );

  // Render progress screen
  const renderProgressScreen = () => (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Creating your ONCHAINID</h2>
        <p className="text-muted-foreground">
          Deploying your identity contract to the blockchain
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm">
          We're creating your ONCHAINID using the identity factory. This is a
          smart contract that will serve as your personal identity anchor on the
          blockchain.
        </p>

        <p className="text-sm">
          It doesn't contain any personal information yet, that comes in the
          next steps, but it's now uniquely linked to your wallet and fully
          under your control.
        </p>

        <p className="text-sm">
          This may take a few moments depending on network speed. Your wallet
          will be used to authorize the transaction.
        </p>

        {/* Spinner and status */}
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">
              "Deploying ONCHAINID contract..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render success screen
  const renderSuccessScreen = () => (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Creating your ONCHAINID</h2>
        <p className="text-muted-foreground">
          Deploying your identity contract to the blockchain
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm">
          We're creating your ONCHAINID using the identity factory. This is a
          smart contract that will serve as your personal identity anchor on the
          blockchain.
        </p>

        <p className="text-sm">
          It doesn't contain any personal information yet, that comes in the
          next steps, but it's now uniquely linked to your wallet and fully
          under your control.
        </p>

        <p className="text-sm">
          This may take a few moments depending on network speed. Your wallet
          will be used to authorize the transaction.
        </p>

        {/* Success state */}
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                ONCHAINID created successfully
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your identity contract is now live on the blockchain.
              </p>
              {onchainIdAddress && (
                <p className="text-sm text-green-700 mt-2">
                  <strong>Contract Address:</strong> {onchainIdAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Main render based on current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "initial":
        return renderInitialScreen();
      case "progress":
        return renderProgressScreen();
      case "success":
        return renderSuccessScreen();
      default:
        return renderInitialScreen();
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentScreen()}

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        title="Enter your PIN code to create ONCHAINID"
        description="You're about to create your ONCHAINID on the blockchain. To authorize this action, we need you to confirm your identity."
        hasPincode={hasPincode}
        hasTwoFactor={hasTwoFactor}
        isLoading={isCreating}
        loadingText="Creating ONCHAINID..."
        confirmText="Create ONCHAINID"
        errorMessage={verificationError}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
      />
    </div>
  );
});
