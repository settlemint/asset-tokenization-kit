import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertCircle, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard';
import { WalletStep } from '@/components/onboarding/steps/wallet-step';
import { type Step, StepWizard } from '@/components/step-wizard/step-wizard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/orpc';

export const Route = createFileRoute('/_private/onboarding/investor')({
  loader: async ({ context }) => {
    // User data is critical for determining step status
    const user = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions()
    );
    return { user };
  },
  component: InvestorOnboarding,
});

// Placeholder component for identity verification
function IdentityStep({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['onboarding', 'general']);

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sm-state-warning-background/20">
          <UserCheck className="h-6 w-6 text-sm-state-warning-background" />
        </div>
        <CardTitle>{t('steps.identity.title')}</CardTitle>
        <CardDescription>{t('steps.identity.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-muted-foreground text-sm">
            {t('steps.identity.info')}
          </p>
        </div>

        <div className="rounded-lg border border-sm-state-warning-background/30 bg-sm-state-warning-background/10 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-sm-state-warning-background" />
            <div className="ml-3">
              <h3 className="font-medium text-sm text-sm-text">
                {t('steps.identity.coming-soon')}
              </h3>
              <div className="mt-2 text-muted-foreground text-sm">
                <p>{t('steps.identity.coming-soon-description')}</p>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={onSuccess}>
          {t('general:continue')}
        </Button>
      </CardContent>
    </Card>
  );
}

function InvestorOnboarding() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const [currentStepId, setCurrentStepId] = useState('wallet');

  // Get user data from loader
  const { user } = Route.useLoaderData();

  // Define steps with dynamic statuses
  const steps: Step[] = [
    {
      id: 'wallet',
      title: t('steps.wallet.title'),
      description: t('steps.wallet.description'),
      status: user.wallet
        ? 'completed'
        : currentStepId === 'wallet'
          ? 'active'
          : 'pending',
    },
    {
      id: 'identity',
      title: t('steps.identity.title'),
      description: t('steps.identity.description'),
      status: currentStepId === 'identity' ? 'active' : 'pending',
    },
  ];

  const handleStepChange = (stepId: string) => {
    setCurrentStepId(stepId);
  };

  const handleWalletSuccess = () => {
    setCurrentStepId('identity');
  };

  const handleIdentitySuccess = () => {
    // Investor onboarding complete, redirect to dashboard
    navigate({ to: '/' });
  };

  return (
    <OnboardingGuard allowedTypes={['investor']} require="not-onboarded">
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            currentStepId={currentStepId}
            description={t('investor.description')}
            onStepChange={handleStepChange}
            steps={steps}
            title={t('investor.title')}
          >
            {currentStepId === 'wallet' && (
              <WalletStep onSuccess={handleWalletSuccess} />
            )}
            {currentStepId === 'identity' && (
              <IdentityStep onSuccess={handleIdentitySuccess} />
            )}
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
