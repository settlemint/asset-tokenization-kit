import { I18nextProvider } from "react-i18next";
import { useEffect } from "react";
import { default as i18n } from "@/lib/i18n/index";
import { useLanguageDetection } from "@/lib/i18n/use-language-detection";

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
}

function I18nProviderContent({ children }: { children: React.ReactNode }) {
  useLanguageDetection();
  return <>{children}</>;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  useEffect(() => {
    if (initialLanguage && initialLanguage !== i18n.language) {
      void i18n.changeLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  return (
    <I18nextProvider i18n={i18n}>
      <I18nProviderContent>{children}</I18nProviderContent>
    </I18nextProvider>
  );
}