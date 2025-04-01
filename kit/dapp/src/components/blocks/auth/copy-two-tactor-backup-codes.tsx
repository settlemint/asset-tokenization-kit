import { CopyToClipboard } from "@/components/blocks/copy/copy";
import { useTranslations } from "next-intl";

export function CopyTwoFactorBackupCodes({
  backupCodes,
}: {
  backupCodes: string[];
}) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication.backup-codes"
  );
  return (
    <CopyToClipboard
      value={backupCodes.join("\n")}
      successMessage={t("copied")}
      displayText={t("copy")}
    />
  );
}
