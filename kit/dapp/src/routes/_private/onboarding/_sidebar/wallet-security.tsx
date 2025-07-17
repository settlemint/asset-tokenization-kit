import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { OtpSetupComponent } from "@/components/onboarding/wallet-security/otp-setup-component";
import { PinSetupComponent } from "@/components/onboarding/wallet-security/pin-setup-component";
import { SecurityMethodSelector } from "@/components/onboarding/wallet-security/security-method-selector";
import { SecuritySuccess } from "@/components/onboarding/wallet-security/security-success";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useCallback } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-security"
)({
  validateSearch: zodValidator(
    z.object({
      step: z.enum(Object.values(OnboardingStep)).optional(),
      subStep: z.enum(["intro", "pin", "otp", "complete"]).optional(),
    })
  ),
  beforeLoad: async ({
    context: { orpc, queryClient },
    search: { step, subStep },
  }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });

    // If we're showing the complete subStep, don't redirect
    if (subStep === "complete") {
      return;
    }

    if (step) {
      if (step !== OnboardingStep.walletSecurity) {
        throw redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.walletSecurity) {
        throw redirect({
          to: `/onboarding/${currentStep}`,
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const { subStep } = Route.useSearch();
  const { refetch } = useSession();

  const handlePinSuccess = useCallback(async () => {
    await refetch();
    await queryClient.refetchQueries({
      queryKey: orpc.user.me.key(),
    });
    await navigate({
      search: () => ({
        step: OnboardingStep.walletSecurity,
        subStep: "complete",
      }),
    });
  }, [refetch, queryClient, navigate]);

  const handleOtpSuccess = useCallback(async () => {
    await refetch();
    await queryClient.refetchQueries({
      queryKey: orpc.user.me.key(),
    });
    await navigate({
      search: () => ({
        step: OnboardingStep.walletSecurity,
        subStep: "complete",
      }),
    });
  }, [refetch, queryClient, navigate]);

  const onNext = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: orpc.user.me.key(),
    });
    await navigate({
      to: `/onboarding/${OnboardingStep.walletRecoveryCodes}`,
    });
  }, [queryClient, navigate]);

  const handlePrevious = useCallback(async () => {
    await navigate({
      to: `/onboarding/${OnboardingStep.wallet}`,
      search: { subStep: "complete" },
    });
  }, [navigate]);

  if (subStep === "complete") {
    return <SecuritySuccess onNext={onNext} />;
  }

  if (subStep === "pin") {
    return (
      <PinSetupComponent
        onSuccess={handlePinSuccess}
        onBack={() => {
          void navigate({
            search: () => ({
              step: OnboardingStep.walletSecurity,
              subStep: "intro",
            }),
          });
        }}
      />
    );
  }

  if (subStep === "otp") {
    return (
      <OtpSetupComponent
        onSuccess={handleOtpSuccess}
        onBack={() => {
          void navigate({
            search: () => ({
              step: OnboardingStep.walletSecurity,
              subStep: "intro",
            }),
          });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <SecurityMethodSelector
          onSetupSecurity={(method) => {
            void navigate({
              search: () => ({
                step: OnboardingStep.walletSecurity,
                subStep: method,
              }),
            });
          }}
        />
      </div>
      <div className="mt-8 pt-6 border-t border-border">
        <footer className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Choose a security method to continue
          </div>
        </footer>
      </div>
    </div>
  );
}
