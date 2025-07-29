import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ReactNode } from "react";

interface DialogLayoutProps {
  children?: ReactNode;
}

/**
 *
 */
export function DialogLayout({ children }: DialogLayoutProps) {
  return (
    <div className="DialogLayout flex flex-col min-h-screen bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')] bg-no-repeat bg-cover">
      <div className="flex-shrink-0 flex justify-between items-center p-8">
        <AssetTokenizationKitLogo />
        <div className="flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="DialogLayout__card flex flex-col justify-center items-center flex-1 overflow-hidden">
        <div className="h-[85vh] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] my-8">
          {children}
        </div>
      </div>
    </div>
  );
}
