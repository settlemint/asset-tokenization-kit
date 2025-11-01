import { useSession } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
export function WelcomeHeader() {
  const { t } = useTranslation("dashboard");
  const { data: session } = useSession();
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {t("portfolioDashboard.welcome", { name: session?.user.name })}
      </h1>
      <p className="text-muted-foreground">
        {t("portfolioDashboard.subtitle")}
      </p>
    </div>
  );
}
