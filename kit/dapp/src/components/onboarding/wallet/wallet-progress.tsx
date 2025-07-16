import { useEffect, useState } from "react";

// TODO: Translations
export function WalletProgress() {
  const [walletCreationProgress, setWalletCreationProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - linearProgress, 3);
      const percentage = easedProgress * 100;

      setWalletCreationProgress(percentage);

      if (linearProgress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
          <div className="w-7 h-7 border-[3px] border-primary/10 border-t-primary border-b-primary rounded-full animate-spin" />
        </div>
      </div>

      {/* Educational text */}
      <div className="space-y-4 mb-6">
        <p className="text-base text-foreground leading-relaxed">
          Your wallet is being created...
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We're generating secure cryptographic keys that will serve as your
          unique digital identity on the blockchain. This process creates a
          mathematical pair of keys - one private (kept secret) and one public
          (shareable) - that enables you to securely interact with digital
          assets and verify your identity.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${walletCreationProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">
          {Math.round(walletCreationProgress)}% Complete
        </p>
      </div>
    </div>
  );
}
