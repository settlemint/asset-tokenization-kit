import { CopyToClipboard } from "@/components/blocks/copy/copy";
import { useTranslations } from "next-intl";

export function CopySecretCodes({ secretCodes }: { secretCodes: string[] }) {
  const t = useTranslations("portfolio.settings.profile.secret-codes");
  return (
    <CopyToClipboard
      value={secretCodes.join("\n")}
      successMessage={t("copied")}
      displayText={t("copy")}
    />
  );
}
