import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard';
import { WalletStep } from '@/components/onboarding/steps/wallet-step';
import { type Step, StepWizard } from '@/components/step-wizard/step-wizard';
import { orpc } from '@/orpc';

export const Route = createFileRoute('/_private/onboarding/issuer')({
  loader: async ({ context }) => {
    // User data is critical for determining step status
    const user = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions()
    );
    return { user };
  },
  component: IssuerOnboarding,
});

function IssuerOnboarding() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const [currentStepId] = useState('wallet');

  // Get user data from loader
  const { user } = Route.useLoaderData();

  // Define steps with dynamic statuses
  const steps: Step[] = [
    {
      id: 'wallet',
      title: t('steps.wallet.title'),
      description: t('steps.wallet.description'),
      status: user.wallet ? 'completed' : 'active',
    },
  ];

  const handleWalletSuccess = () => {
    // Issuer onboarding complete, redirect to dashboard
    navigate({ to: '/' });
  };

  return (
    <OnboardingGuard allowedTypes={['issuer']} require="not-onboarded">
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            currentStepId={currentStepId}
            description={t('issuer.description')}
            onStepChange={() => {
              // Only one step for issuer onboarding
            }}
            steps={steps}
            title={t('issuer.title')}
          >
            <WalletStep onSuccess={handleWalletSuccess} />
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
