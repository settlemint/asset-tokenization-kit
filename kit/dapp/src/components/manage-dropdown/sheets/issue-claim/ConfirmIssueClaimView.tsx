import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormFieldConfig } from "@/lib/utils/claims/claim-schema-builder";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { useTranslation } from "react-i18next";
import type { IssueClaimTopic } from "../issue-claim-sheet";

interface ConfirmIssueClaimViewProps {
  topic: IssueClaimTopic;
  claim: ClaimData | null;
  formFields?: FormFieldConfig[];
  signature?: string;
}

export function ConfirmIssueClaimView({
  topic,
  claim,
  formFields,
}: ConfirmIssueClaimViewProps) {
  const { t } = useTranslation("identities");
  const { t: tComponents } = useTranslation("components");
  const { t: tCommon } = useTranslation("common");

  const shortenAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const formatClaimData = () => {
    if (!claim || !("data" in claim)) return null;

    let entries: Array<[string, unknown]>;

    // Check if this is a custom claim (array format) or predefined claim (object format)
    if (Array.isArray(claim.data)) {
      // Custom claim - map array indices to field names using formFields
      if (!formFields || formFields.length === 0) {
        return null;
      }

      entries = claim.data
        .map((value, index) => {
          const field = formFields[index];
          return field ? ([field.name, value] as [string, unknown]) : null;
        })
        .filter(
          (entry): entry is [string, unknown] =>
            entry !== null && entry[1] !== undefined && entry[1] !== ""
        );
    } else {
      // Predefined claim - use object entries directly
      entries = Object.entries(claim.data as Record<string, unknown>).filter(
        ([, value]) => value !== undefined && value !== ""
      );
    }

    if (entries.length === 0) return null;

    return entries.map(([key, value]) => {
      let displayValue: string;

      if (typeof value === "boolean") {
        displayValue = value ? tCommon("yes") : tCommon("no");
      } else if (
        key === "expiryTimestamp" ||
        key === "validUntil" ||
        key === "lastUpdated"
      ) {
        const parsed = Number.parseInt(String(value), 10);
        displayValue = Number.isNaN(parsed)
          ? String(value)
          : new Date(parsed * 1000).toLocaleDateString();
      } else if (key === "issuerAddress" || key === "contractAddress") {
        displayValue = shortenAddress(String(value));
      } else {
        displayValue = Array.isArray(value) ? value.join(", ") : String(value);
      }

      return (
        <div
          key={key}
          className="flex justify-between border-b py-2 last:border-0"
        >
          <span className="text-sm text-muted-foreground capitalize">
            {key.replaceAll(/([A-Z])/g, " $1").trim()}
          </span>
          <span className="text-sm font-medium text-right">{displayValue}</span>
        </div>
      );
    });
  };

  const badgeLabel = topic
    ? tComponents(`claimTopics.${topic}`, topic)
    : tCommon("none");

  const claimDetails = formatClaimData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("actions.issueClaim.confirmTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("actions.issueClaim.confirmClaimType")}
          </p>
          <Badge variant="secondary">{badgeLabel}</Badge>
        </div>

        {claim && claimDetails && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              {t("actions.issueClaim.confirmClaimData")}
            </p>
            <div className="rounded-md bg-muted p-3">{claimDetails}</div>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("actions.issueClaim.confirmWarning")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
