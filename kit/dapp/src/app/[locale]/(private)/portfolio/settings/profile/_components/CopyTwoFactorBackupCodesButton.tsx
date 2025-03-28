import { CopyToClipboard } from "@/components/blocks/copy/copy";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function CopyTwoFactorBackupCodesButton({
  backupCodes,
  buttonVariant = "secondary",
}: {
  backupCodes: string[];
  buttonVariant?: "secondary" | "default";
}) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication.backup-codes"
  );
  return (
    <Button variant={buttonVariant}>
      <CopyToClipboard
        value={backupCodes.join("\n")}
        successMessage={t("copied")}
        displayText={t("copy")}
      />
    </Button>
  );
}
