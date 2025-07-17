import { updateOnboardingStateMachine } from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, CircleArrowRight, CircleDot } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "usehooks-ts";

export const Route = createFileRoute("/_private/onboarding/")({
  loader: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery(orpc.user.me.queryOptions());
    return updateOnboardingStateMachine({ user });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { steps } = Route.useLoaderData();
  const [isReturningUser] = useLocalStorage("isReturningUser", false);
  const navigate = useNavigate();

  const handleGetStarted = useCallback(() => {
    void navigate({ to: "/onboarding/wallet" });
  }, [navigate]);

  return (
    <div className="p-12 max-w-2xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-primary-foreground">
          {isReturningUser ? `Welcome back!` : t("onboarding:welcome.title")}
        </h1>
        <p className="text-lg text-primary-foreground/90">
          {isReturningUser
            ? "Let's complete your onboarding journey"
            : t("onboarding:welcome.description")}
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary-foreground">
            Before you get started...
          </h2>
          <p className="text-primary-foreground/80">
            {isReturningUser
              ? "We first need to finish the setup process. This ensures your assets are secure, your on-chain identity is established, and you're ready to experience the future of finance."
              : "We'll guide you through a quick setup process. This ensures your assets are secure, your on-chain identity is established, and you're ready to experience the future of finance."}
          </p>
        </div>
      </div>

      <ul className="space-y-4 text-left">
        {steps.map((step) => (
          <li key={step.step} className="flex gap-3">
            <div className="mt-1 flex-shrink-0">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-sm-state-success-background" />
              ) : step.current ? (
                <CircleArrowRight className="w-5 h-5 animate-pulse" />
              ) : (
                <CircleDot className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-primary-foreground">
                {t(`onboarding:steps.${step.step}.title`, {
                  defaultValue: step.step,
                })}
              </h3>
              <p className="text-sm text-primary-foreground/80">
                {t(`onboarding:steps.${step.step}.description`, {
                  defaultValue: step.step,
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-8">
        <Button
          size="lg"
          variant="default"
          className="min-w-[200px]"
          onClick={handleGetStarted}
        >
          Let's go
        </Button>
      </div>
    </div>
  );
}
