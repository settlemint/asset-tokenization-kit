import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStartSetup: () => void;
  completedSteps?: {
    wallet?: boolean;
    system?: boolean;
    identity?: boolean;
  };
  systemDeployed?: boolean;
  userName?: string;
  isReturningUser?: boolean;
}

export function WelcomeScreen({
  onStartSetup,
  completedSteps = {},
  userName,
  isReturningUser = false,
}: WelcomeScreenProps) {
  const allSteps = [
    {
      id: "wallet",
      title: "Create your wallet",
      description:
        "Create and secure your Web3 wallet, this is how you sign transactions.",
      completed: completedSteps.wallet ?? false,
    },
    {
      id: "system",
      title: "Setup the system",
      description:
        "Setup the system to create secure and regulatory compliant assets.",
      completed: completedSteps.system ?? false,
    },
    {
      id: "identity",
      title: "Identity",
      description:
        "Setup your ONCHAINID and provide KYC information to start the verification process.",
      completed: completedSteps.identity ?? false,
    },
  ];

  // Show all steps - don't filter any out
  const steps = allSteps;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="rounded-xl shadow-lg overflow-hidden">
          {/* Gradient background container */}
          <div
            className="p-12 text-center"
            style={{
              background: "var(--sm-wizard-sidebar-gradient)",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-primary-foreground">
                  {isReturningUser && userName
                    ? `Welcome back, ${userName}`
                    : "Welcome to Asset Tokenization Kit"}
                </h1>
                <p className="text-lg text-primary-foreground/90">
                  {isReturningUser
                    ? "Let's complete your onboarding journey"
                    : "Your gateway to secure, compliant asset tokenization on the blockchain."}
                </p>
              </div>

              {/* Before you get started section */}
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

                {/* Steps list */}
                <ul className="space-y-4 text-left">
                  {steps.map((step) => (
                    <li key={step.id} className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {step.completed ? (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-foreground/20" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-primary-foreground">
                          {step.title}
                        </h3>
                        <p className="text-sm text-primary-foreground/80">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-8">
                <Button
                  size="lg"
                  onClick={onStartSetup}
                  className="min-w-[200px] bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Let's go
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
