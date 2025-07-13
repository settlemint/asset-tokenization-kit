import { onboardingSteps } from "@/components/onboarding/simplified/state-machine";
import { useStore } from "@tanstack/react-store";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "usehooks-ts";

export function WelcomeScreen() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { initialSteps } = useStore(onboardingSteps);
  const [isReturningUser] = useLocalStorage("isReturningUser", false);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
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
      <ul className="space-y-4 text-left">
        {initialSteps.map((step) => (
          <li key={step} className="flex gap-3">
            <div className="mt-1 flex-shrink-0">
              {step ? (
                <CheckCircle className="w-5 h-5 text-sm-state-success-background" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-foreground/20" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-primary-foreground">{step}</h3>
              <p className="text-sm text-primary-foreground/80">{step}</p>
            </div>
          </li>
        ))}
      </ul>
      xx
    </div>
  );
}
