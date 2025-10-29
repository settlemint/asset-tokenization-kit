import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { AddTopicDialog } from "@/components/platform-settings/claim-topics/add-topic-dialog";
import { TopicsTable } from "@/components/platform-settings/claim-topics/topics-table";
import { AddTrustedIssuerSheet } from "@/components/platform-settings/trusted-issuers/add-trusted-issuer-sheet";
import { TrustedIssuersTable } from "@/components/platform-settings/trusted-issuers/trusted-issuers-table";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield } from "lucide-react";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/platform-settings/claim-topics-issuers"
)({
  component: ClaimTopicsIssuersPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/platform-settings/claim-topics-issuers",
        }),
        createI18nBreadcrumbMetadata("settings.claimTopicsIssuers.title"),
      ],
    };
  },
});

function ClaimTopicsIssuersPage() {
  const { t } = useTranslation("claim-topics-issuers");
  const { t: tNav } = useTranslation("navigation");
  const [showAddTopicDialog, setShowAddTopicDialog] = useState(false);
  const [showAddIssuerSheet, setShowAddIssuerSheet] = useState(false);

  // Get current user data with roles
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const roles = system.userPermissions?.roles;
  const canManageClaimTopicsIssuers = Boolean(roles?.claimPolicyManager);

  // Full-width layout keeps claim topic and issuer tables aligned with surrounding actions.
  return (
    <div className="w-full p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">
          {tNav("settings.claimTopicsIssuers.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("page.description")}</p>
      </div>

      <div className="space-y-6">
        {!canManageClaimTopicsIssuers && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>
              {tNav("settings.claimTopicsIssuers.notAuthorized")}
            </AlertTitle>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("claimTopics.title")}</CardTitle>
                <CardDescription>
                  {t("claimTopics.description")}
                </CardDescription>
              </div>
              {system?.userPermissions?.actions.topicCreate && (
                <Button
                  onClick={() => {
                    setShowAddTopicDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("claimTopics.addButton")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<DataTableSkeleton />}>
              <TopicsTable />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("trustedIssuers.title")}</CardTitle>
                <CardDescription>
                  {t("trustedIssuers.description")}
                </CardDescription>
              </div>
              {system?.userPermissions?.actions.trustedIssuerCreate && (
                <Button
                  onClick={() => {
                    setShowAddIssuerSheet(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("trustedIssuers.addButton")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<DataTableSkeleton />}>
              <TrustedIssuersTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <AddTopicDialog
        open={showAddTopicDialog}
        onOpenChange={setShowAddTopicDialog}
      />
      <Suspense>
        <AddTrustedIssuerSheet
          open={showAddIssuerSheet}
          onOpenChange={setShowAddIssuerSheet}
        />
      </Suspense>
    </div>
  );
}
