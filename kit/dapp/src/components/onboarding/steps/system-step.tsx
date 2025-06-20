import { Logo } from "@/components/logo/logo";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc";
import { Check } from "lucide-react";
import { forwardRef, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SystemStepProps {
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
}

export function SystemStep({ onSuccess, onRegisterAction }: SystemStepProps) {
  const [systemAddress, setSystemAddress] = useSettings("SYSTEM_ADDRESS");
  const queryClient = useQueryClient();

  // Refs for animated beams
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: async (data) => {
      console.log("System deployment success:", data);
      setSystemAddress(data);
      // Invalidate the settings query so the parent component gets the updated system address
      await queryClient.invalidateQueries({
        queryKey: orpc.settings.read.queryOptions({
          input: { key: "SYSTEM_ADDRESS" },
        }).queryKey,
      });
      onSuccess?.();
    },
  });

  const hasSystem = !!systemAddress;
  const isDeploying = isCreatingSystem || isTracking;

  // Handle deploy system when button is clicked
  const handleDeploySystem = () => {
    if (!hasSystem && !isDeploying) {
      createSystem({});
    }
  };

  // Register the action with parent
  useEffect(() => {
    if (onRegisterAction && !hasSystem) {
      onRegisterAction(handleDeploySystem);
    }
  }, [onRegisterAction, hasSystem]);

  // Define Circle component
  const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
  >(({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className
        )}
      >
        {children}
      </div>
    );
  });
  Circle.displayName = "Circle";

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-2xl p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {hasSystem ? "System Deployed" : "Deploy SMART System"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {hasSystem
                ? "Your blockchain infrastructure is ready"
                : "Deploy your blockchain infrastructure for asset tokenization"}
            </p>
          </div>

          {/* Animated deployment visualization - show during deployment and after completion */}
          {(isDeploying || hasSystem) && (
            <div
              className="relative flex h-[300px] w-full items-center justify-center overflow-hidden p-10"
              ref={containerRef}
            >
              <div className="flex size-full max-h-[200px] max-w-lg flex-col items-stretch justify-between gap-10">
                <div className="flex flex-row items-center justify-between">
                  <Circle ref={div1Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                  <Circle ref={div5Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <Circle ref={div2Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                  <Circle ref={centerRef} className="size-16">
                    <Logo variant="icon" className="h-10 w-10" />
                  </Circle>
                  <Circle ref={div6Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <Circle ref={div3Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                  <Circle ref={div4Ref}>
                    {hasSystem ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <img
                        src="/illustrations/solidity_logo.svg"
                        alt="Solidity"
                        className="h-6 w-6 dark:invert"
                      />
                    )}
                  </Circle>
                </div>
              </div>

              {/* Animated Beams */}
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={centerRef}
                curvature={-75}
                endYOffset={-10}
                gradientStartColor="oklch(var(--sm-graphics-primary))"
                gradientStopColor="oklch(var(--sm-graphics-secondary))"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={centerRef}
                gradientStartColor="oklch(var(--sm-graphics-tertiary))"
                gradientStopColor="oklch(var(--sm-graphics-quaternary))"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={centerRef}
                curvature={75}
                endYOffset={10}
                gradientStartColor="oklch(var(--sm-accent))"
                gradientStopColor="oklch(var(--sm-graphics-primary))"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={centerRef}
                curvature={-75}
                endYOffset={-10}
                reverse
                gradientStartColor="oklch(var(--sm-graphics-secondary))"
                gradientStopColor="oklch(var(--sm-graphics-tertiary))"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={centerRef}
                reverse
                gradientStartColor="oklch(var(--sm-graphics-quaternary))"
                gradientStopColor="oklch(var(--sm-accent))"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={centerRef}
                curvature={75}
                endYOffset={10}
                reverse
                gradientStartColor="oklch(var(--sm-graphics-primary))"
                gradientStopColor="oklch(var(--sm-graphics-secondary))"
              />
            </div>
          )}

          {/* Status display */}
          {hasSystem && !isDeploying ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-green-800 dark:text-green-300">
                    System Deployed Successfully
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Contract Address
                  </p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {systemAddress}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            !isDeploying && (
              <div className="space-y-4">
                {/* Info box */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        What is a SMART system?
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        SMART System is SettleMint's comprehensive blockchain
                        system that enables compliant asset tokenization with
                        built-in identity management and regulatory compliance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                  <svg
                    className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      System deployment
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      This process may take 2-3 minutes to complete
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
