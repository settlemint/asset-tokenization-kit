import { AuthQueryContext } from '@daveyplate/better-auth-tanstack';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth.client';
import { queryClient } from '@/lib/query.client';

interface WalletStepProps {
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
}

export function WalletStep({ onSuccess, onRegisterAction }: WalletStepProps) {
  const { data: session } = authClient.useSession();
  const { sessionKey } = useContext(AuthQueryContext);
  const { t } = useTranslation(['onboarding', 'general']);
  const [justGenerated, setJustGenerated] = useState(false);

  const user = session?.user;
  const hasWallet = !!user?.initialOnboardingFinished;

  const { mutate: generateWallet, isPending } = useMutation({
    mutationFn: async () => {
      await authClient.wallet({
        messages: {
          walletAlreadyExists: t('onboarding:wallet.already-exists'),
          walletCreationFailed: t('onboarding:wallet.creation-failed'),
        },
      });
      // TODO: Remove this once we have a proper pincode setup flow
      await authClient.pincode.enable({
        pincode: '111111',
      });
    },
    onSuccess: () => {
      toast.success(t('onboarding:wallet.generated'));
      queryClient.invalidateQueries({
        queryKey: sessionKey,
      });
      setJustGenerated(true);
      // Call the parent's onSuccess callback to advance to next step
      onSuccess?.();
    },
  });

  // Handle generate wallet
  const handleGenerateWallet = useCallback(() => {
    if (!(isPending || hasWallet)) {
      generateWallet();
    }
  }, [isPending, hasWallet, generateWallet]);

  // Register the action with parent when conditions change
  useEffect(() => {
    if (onRegisterAction) {
      if (hasWallet) {
        // Unregister by passing a no-op function when wallet exists
        onRegisterAction(() => {
          // No action needed when wallet already exists
        });
      } else {
        onRegisterAction(handleGenerateWallet);
      }
    }
  }, [onRegisterAction, hasWallet, handleGenerateWallet]);

  // Don't auto-advance - removed the auto success callback

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-semibold text-xl">
          {hasWallet
            ? t('wallet.your-wallet')
            : t('wallet.generate-your-wallet')}
        </h2>
        <p className="pt-2 text-muted-foreground text-sm">
          {hasWallet
            ? t('wallet.blockchain-identity-ready')
            : t('wallet.create-secure-wallet')}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: '450px', maxHeight: '550px' }}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Wallet display or generation */}
          {hasWallet ? (
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
                    {t('wallet.wallet-generated-successfully')}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-xs uppercase tracking-wider dark:text-gray-400">
                    {t('wallet.address-label')}
                  </p>
                  {justGenerated ? (
                    <p className="break-all font-mono text-gray-900 text-sm dark:text-gray-100">
                      {user.wallet}
                    </p>
                  ) : (
                    <p className="break-all font-mono text-gray-900 text-sm dark:text-gray-100">
                      {user.wallet}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
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
                      {t('wallet.what-is-wallet')}
                    </h3>
                    <p className="text-blue-800 text-sm dark:text-blue-200">
                      {t('wallet.wallet-description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                  <span>{t('wallet.features.secure')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>{t('wallet.features.instant')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>{t('wallet.features.protected')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>{t('wallet.features.global')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
