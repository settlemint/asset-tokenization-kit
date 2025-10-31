import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authPublicConfig } from "@/lib/auth/public-config";
import {
  ChangeEmailCard,
  ChangePasswordCard,
  ApiKeysCard,
} from "@daveyplate/better-auth-ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ProfileKycCard } from "@/components/account/profile/profile-kyc-card";
import { orpc } from "@/orpc/orpc-client";

const CARD_CLASS_NAMES = {
  base: "flex h-full flex-col",
  content: "flex-1",
  footer:
    "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
  title: "!text-base md:!text-base",
} as const;

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/profile"
)({
  component: Profile,
});

function Profile() {
  const { t } = useTranslation(["user", "common"]);
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.description")}</p>
      </div>

      <div className="grid gap-6">
        <ProfileKycCard userId={user.id} />

        <div className="grid gap-4 md:grid-cols-2">
          {authPublicConfig.changeEmailEnabled ? (
            <ChangeEmailCard className="h-full" />
          ) : (
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{t("fields.email")}</CardTitle>
                <CardDescription>
                  {t("profile.email.change-disabled")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {t("profile.email.current")}
                </p>
                <Input
                  value={user.email ?? "-"}
                  readOnly
                  className="font-medium"
                />
              </CardContent>
            </Card>
          )}
          <ChangePasswordCard
            className="h-full"
            classNames={CARD_CLASS_NAMES}
          />
        </div>
        <ApiKeysCard classNames={CARD_CLASS_NAMES} />
      </div>
    </div>
  );
}
