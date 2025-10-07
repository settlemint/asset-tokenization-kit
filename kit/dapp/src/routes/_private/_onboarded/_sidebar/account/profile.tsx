import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountries } from "@/hooks/use-countries";
import { getErrorCode, isORPCError } from "@/hooks/use-error-info";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { orpc } from "@/orpc/orpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/profile"
)({
  component: Profile,
});

function Profile() {
  const { t } = useTranslation(["user", "components", "common"]);
  const { getCountryMap } = useCountries();

  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  const {
    data: kyc,
    isPending: isKycLoading,
    error: kycError,
  } = useQuery(
    orpc.user.kyc.read.queryOptions({
      input: { userId: user.id },
      enabled: Boolean(user.id),
      throwOnError: false,
    })
  );

  const displayName = getUserDisplayName(user);

  const countryMap = useMemo(() => getCountryMap(), [getCountryMap]);
  const countryName = useMemo(() => {
    if (!kyc?.country) return undefined;
    const upperCaseCode = kyc.country.toUpperCase();
    return countryMap[upperCaseCode] ?? countryMap[kyc.country] ?? kyc.country;
  }, [countryMap, kyc?.country]);

  const residencyStatusLabel = useMemo(() => {
    if (!kyc?.residencyStatus) return undefined;
    return t(`kycForm.residencyStatusOptions.${kyc.residencyStatus}`, {
      ns: "components",
      defaultValue: kyc.residencyStatus.replaceAll("_", " "),
    });
  }, [kyc?.residencyStatus, t]);

  const formattedDob = useMemo(() => {
    if (!kyc?.dob) return undefined;
    return new Date(kyc.dob);
  }, [kyc?.dob]);

  const isMissingKycProfile = useMemo(() => {
    if (!kycError) return false;

    const status = getErrorCode(kycError);
    if (status === 404 || status === "404") return true;

    const codeCandidate = isORPCError(kycError)
      ? kycError.code
      : typeof kycError === "object" && kycError !== null
        ? (kycError as { code?: unknown }).code
        : undefined;

    if (typeof codeCandidate === "string") {
      const normalized = codeCandidate.toUpperCase();
      return normalized === "NOT_FOUND" || normalized.endsWith("_NOT_FOUND");
    }

    return false;
  }, [kycError]);

  // If the KYC profile is missing, we don't want to show an error.
  const showKycError = Boolean(kycError && !kyc && !isMissingKycProfile);

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("user:profile.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("user:profile.description")}
        </p>
      </div>

      <DetailGrid title={t("user:tabs.details")}>
        <DetailGridItem
          label={t("user:fields.fullName")}
          info={t("user:fields.fullNameInfo")}
          value={displayName ?? user.name ?? user.email}
          type="text"
        />

        <DetailGridItem
          label={t("user:fields.email")}
          info={t("user:fields.emailInfo")}
        >
          <CopyToClipboard value={user.email ?? "-"} className="w-full">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-default truncate">
                  {user.email ?? "-"}
                </span>
              </HoverCardTrigger>
              {user.email ? (
                <HoverCardContent className="w-auto max-w-[24rem]">
                  <div className="break-all font-mono text-sm">
                    {user.email}
                  </div>
                </HoverCardContent>
              ) : null}
            </HoverCard>
          </CopyToClipboard>
        </DetailGridItem>

        <DetailGridItem
          label={t("user:fields.walletAddress")}
          info={t("user:fields.walletAddressInfo")}
          value={user.wallet}
          type="address"
          emptyValue={t("user:fields.noWalletConnected")}
          showPrettyName={false}
        />
      </DetailGrid>

      {isKycLoading ? (
        <DetailGrid title={t("user:details.kycInformation")} className="mt-4">
          <DetailGridItem label={t("components:kycForm.firstName")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
          <DetailGridItem label={t("components:kycForm.lastName")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
          <DetailGridItem label={t("components:kycForm.dob")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
          <DetailGridItem label={t("components:kycForm.country")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
          <DetailGridItem label={t("components:kycForm.residencyStatus")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
          <DetailGridItem label={t("components:kycForm.nationalId")}>
            <Skeleton className="h-5 w-full" />
          </DetailGridItem>
        </DetailGrid>
      ) : kyc ? (
        <DetailGrid title={t("user:details.kycInformation")} className="mt-4">
          <DetailGridItem
            label={t("components:kycForm.firstName")}
            value={kyc.firstName}
            emptyValue="-"
          />
          <DetailGridItem
            label={t("components:kycForm.lastName")}
            value={kyc.lastName}
            emptyValue="-"
          />
          <DetailGridItem
            label={t("components:kycForm.dob")}
            value={formattedDob}
            type="date"
            emptyValue="-"
          />
          <DetailGridItem
            label={t("components:kycForm.country")}
            value={countryName}
            emptyValue="-"
          />
          <DetailGridItem
            label={t("components:kycForm.residencyStatus")}
            value={residencyStatusLabel}
            emptyValue="-"
          />
          <DetailGridItem
            label={t("components:kycForm.nationalId")}
            value={kyc.nationalId}
            emptyValue="-"
          />
        </DetailGrid>
      ) : showKycError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("user:details.kycInformation")}</AlertTitle>
          <AlertDescription>
            {t("common:errors.somethingWentWrong")}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTitle>{t("user:details.kycInformation")}</AlertTitle>
          <AlertDescription>
            {t("components:kycForm.identity.confirm-description")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
