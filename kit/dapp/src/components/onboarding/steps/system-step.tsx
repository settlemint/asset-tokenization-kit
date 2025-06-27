import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';
import { PincodeInput } from '@/components/onboarding/pincode-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSettings } from '@/hooks/use-settings';
import { useStreamingMutation } from '@/hooks/use-streaming-mutation';
import { queryClient } from '@/lib/query.client';
import { cn } from '@/lib/utils';
import { orpc } from '@/orpc';

// Pincode validation schema
const pincodeSchema = z.object({
  pincode: z.string().length(6, 'PIN code must be exactly 6 digits'),
});

type PincodeFormValues = z.infer<typeof pincodeSchema>;

interface SystemStepProps {
  systemAddress?: string | null;
  isSystemDeployed?: boolean;
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
}

// Define Circle component
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

export function SystemStep({
  systemAddress: propSystemAddress,
  isSystemDeployed = false,
  onSuccess,
  onRegisterAction,
}: SystemStepProps) {
  const { t } = useTranslation(['onboarding', 'general']);
  const [systemAddressFromSettings, , invalidateSetting] =
    useSettings('SYSTEM_ADDRESS');

  // Use prop system address if provided, otherwise fall back to settings
  const systemAddress = propSystemAddress ?? systemAddressFromSettings;
  const [showPincodePrompt, setShowPincodePrompt] = useState(false);

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: '',
    },
  });

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: async () => {
      // Wait for settings cache to refresh before advancing to next step
      invalidateSetting();
      await queryClient.refetchQueries({
        queryKey: orpc.settings.read.key({
          input: { key: 'SYSTEM_ADDRESS' },
        }),
      });
      setShowPincodePrompt(false);
      form.reset();
      onSuccess?.();
    },
  });

  const hasSystem =
    isSystemDeployed || (!!systemAddress && systemAddress.trim() !== '');
  const isDeploying = isCreatingSystem || isTracking;

  // Reset pincode prompt when system is already deployed
  useEffect(() => {
    if (hasSystem && showPincodePrompt) {
      setShowPincodePrompt(false);
    }
  }, [hasSystem, showPincodePrompt]);

  // Force refresh settings on component mount to ensure we have latest data
  useEffect(() => {
    // Invalidate and refresh the system address setting
    invalidateSetting();
  }, [invalidateSetting]);

  // Handle deploy system when button is clicked
  const handleDeploySystem = useCallback(() => {
    if (!(hasSystem || isDeploying)) {
      setShowPincodePrompt(true);
    }
  }, [hasSystem, isDeploying]);

  // Handle pincode submission
  const handlePincodeSubmit = useCallback(
    (values: PincodeFormValues) => {
      createSystem({
        verification: {
          verificationCode: values.pincode,
          verificationType: 'pincode',
        },
        messages: {
          // Transaction tracking messages
          streamTimeout: t('system.transaction-tracking.stream-timeout'),
          waitingForMining: t('system.transaction-tracking.waiting-for-mining'),
          transactionFailed: t(
            'system.transaction-tracking.transaction-failed'
          ),
          transactionDropped: t(
            'system.transaction-tracking.transaction-dropped'
          ),
          waitingForIndexing: t(
            'system.transaction-tracking.waiting-for-indexing'
          ),
          transactionIndexed: t(
            'system.transaction-tracking.transaction-indexed'
          ),
          indexingTimeout: t('system.transaction-tracking.indexing-timeout'),
          // System-specific messages
          systemCreated: t('system.messages.created'),
          creatingSystem: t('system.messages.creating'),
          systemCreationFailed: t('system.messages.creation-failed'),
          bootstrappingSystem: t('system.messages.bootstrapping-system'),
          bootstrapFailed: t('system.messages.bootstrap-failed'),
          systemCreatedBootstrapFailed: t(
            'system.messages.system-created-bootstrap-failed'
          ),
          initialLoading: t('system.messages.initial-loading'),
          noResultError: t('system.messages.no-result-error'),
          defaultError: t('system.messages.default-error'),
        },
      });
    },
    [createSystem, t]
  );

  // Register the action with parent
  useEffect(() => {
    if (onRegisterAction) {
      if (hasSystem || isDeploying) {
        // No action needed when system is deployed or currently deploying
        onRegisterAction(() => {
          // No-op function for completed state
        });
      } else {
        // If PIN prompt is shown, submit the form; otherwise show the prompt
        const action = showPincodePrompt
          ? () => {
              // Submit the form programmatically
              form.handleSubmit(handlePincodeSubmit)();
            }
          : handleDeploySystem;
        onRegisterAction(action);
      }
    }
  }, [
    onRegisterAction,
    hasSystem,
    isDeploying,
    showPincodePrompt,
    form,
    handleDeploySystem,
    handlePincodeSubmit,
  ]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-semibold text-xl">
          {hasSystem
            ? t('system.system-deployed')
            : t('system.deploy-smart-system')}
        </h2>
        <p className="pt-2 text-muted-foreground text-sm">
          {hasSystem
            ? t('system.your-blockchain-infrastructure-ready')
            : t('system.deploy-blockchain-infrastructure')}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: '450px', maxHeight: '550px' }}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Animated deployment visualization - show during deployment only */}
          {isDeploying && <p>Deploying...</p>}

          {/* Status display */}
          {hasSystem && !isDeploying ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <div className="mb-3 flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="font-medium text-green-800 dark:text-green-300">
                    {t('system.system-deployed-successfully')}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">
                    {t('system.contract-address')}
                  </p>
                  <p className="break-all font-mono text-gray-900 text-sm dark:text-gray-100">
                    {systemAddress ?? systemAddressFromSettings ?? 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          ) : !isDeploying && showPincodePrompt ? (
            /* Pincode prompt for system deployment */
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-medium text-blue-900 text-sm dark:text-blue-100">
                      Verify with PIN Code
                    </h3>
                    <p className="text-blue-800 text-sm dark:text-blue-200">
                      Enter your 6-digit PIN code to authorize the system
                      deployment.
                    </p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(handlePincodeSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center space-y-4">
                        <FormLabel className="font-medium text-base">
                          Enter your PIN code
                        </FormLabel>
                        <FormControl>
                          <PincodeInput
                            autoFocus
                            disabled={isDeploying}
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          ) : (
            !isDeploying && (
              <div className="space-y-4">
                {/* Info box */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-medium text-blue-900 text-sm dark:text-blue-100">
                        {t('system.what-is-smart-system')}
                      </h3>
                      <p className="text-blue-800 text-sm dark:text-blue-200">
                        {t('system.smart-system-description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <svg
                    className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 text-sm dark:text-amber-300">
                      {t('system.system-deployment')}
                    </p>
                    <p className="text-amber-600 text-sm dark:text-amber-400">
                      {t('system.deployment-time-notice')}
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
