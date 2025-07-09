import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStartSetup: () => void;
}

export function WelcomeScreen({ onStartSetup }: WelcomeScreenProps) {
  return (
    <div className="bg-background/95 backdrop-blur-sm rounded-xl border shadow-lg p-8 text-center">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to SettleMint
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Let's set up your secure wallet to get started with asset
              tokenization
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Secure Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Your digital identity protected by advanced cryptography
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Instant Setup</h3>
            <p className="text-sm text-muted-foreground">
              Get up and running in under 2 minutes
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Enterprise Ready</h3>
            <p className="text-sm text-muted-foreground">
              Built for professional asset tokenization
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button size="lg" onClick={onStartSetup} className="w-full max-w-xs">
            Set Up My Wallet
          </Button>
          <p className="text-xs text-muted-foreground">
            Your wallet will be created securely and stored locally
          </p>
        </div>
      </div>
    </div>
  );
}
