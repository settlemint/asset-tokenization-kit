import { orpc } from "@/orpc";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";

/**
 * Finish Step Component
 *
 * Final onboarding step that shows completion message and provides navigation to home.
 */
export const FinishComponent = memo(function FinishComponent({
  onPrevious,
  isFirstStep,
}: {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const navigate = useNavigate();

  // Mutation to mark onboarding as complete
  const { mutate: completeOnboardingMutation, isPending } = useMutation(
    orpc.user.completeOnboarding.mutationOptions({
      onSuccess: () => {
        toast.success("Onboarding completed successfully!");
        void navigate({ to: "/" });
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to complete onboarding: ${error.message}`);
      },
    })
  );

  // Handle navigation to home page
  const handleGoToHome = useCallback(() => {
    completeOnboardingMutation(undefined);
  }, [completeOnboardingMutation]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Onboarding Completed</h2>
          <p className="text-muted-foreground">
            Congratulations! You've successfully completed the onboarding
            process.
          </p>
        </div>

        {/* Additional information */}
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your platform is now set up and ready to use. You can start creating
            and managing digital assets, configure additional settings, and
            explore all the features available to you.
          </p>
          <p>
            If you need to update any information or configure additional
            settings, you can always access these options from your dashboard.
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleGoToHome}
          disabled={isPending}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Completing..." : "Go to my Home page"}
        </button>
      </div>
    </div>
  );
});
