import { useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { memo, useCallback } from "react";

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

  // Handle navigation to home page
  const handleGoToHome = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

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
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          >
            Previous
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleGoToHome}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to my Home page
        </button>
      </div>
    </div>
  );
});
