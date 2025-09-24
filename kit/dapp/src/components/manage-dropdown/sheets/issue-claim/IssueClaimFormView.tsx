import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { useAppForm } from "@/hooks/use-app-form";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IssueClaimFormData, IssueClaimTopic } from "../issue-claim-sheet";

const TEXT_CLAIM_TOPICS = new Set<IssueClaimTopic>([
  "knowYourCustomer",
  "antiMoneyLaundering",
  "qualifiedInstitutionalInvestor",
  "professionalInvestor",
  "accreditedInvestor",
  "accreditedInvestorVerified",
  "regulationS",
]);

const COLLATERAL_DEFAULT_PLACEHOLDER = "1000000000000000000";

type AppFormInstance = ReturnType<typeof useAppForm>;

interface IssueClaimFormViewProps {
  form: AppFormInstance;
  topics: Array<{ name: string; signature: string }>;
  values: IssueClaimFormData;
  userCanIssueTopic: boolean;
  onTopicChange: (topic: IssueClaimTopic) => void;
  toDateTimeValue: (timestamp: string | undefined) => string;
  fromDateTimeValue: (value: string) => string;
}

const renderFieldErrors = (errors?: Array<string | undefined>) => {
  if (!errors || errors.length === 0) return null;
  const filtered = errors.filter(Boolean) as string[];
  if (filtered.length === 0) return null;
  return <p className="text-xs text-destructive">{filtered.join(", ")}</p>;
};

export function IssueClaimFormView({
  form,
  topics,
  values,
  userCanIssueTopic,
  onTopicChange,
  toDateTimeValue,
  fromDateTimeValue,
}: IssueClaimFormViewProps) {
  const { t } = useTranslation("identities");
  const { t: tComponents } = useTranslation("components");
  const { t: tCommon } = useTranslation("common");

  const selectedTopic = values.topic;

  const renderTextField = (
    fieldName: keyof IssueClaimFormData,
    label: string,
    {
      description,
      placeholder,
      type = "text",
      required,
    }: {
      description?: string;
      placeholder?: string;
      type?: string;
      required?: boolean;
    } = {}
  ) => (
    <form.AppField name={fieldName as string}>
      {(field) => (
        <div className="space-y-2">
          <Label htmlFor={fieldName as string}>{label}</Label>
          <Input
            id={fieldName as string}
            type={type}
            value={(field.state.value as string | undefined) ?? ""}
            onChange={(event) => {
              field.handleChange(event.target.value);
            }}
            placeholder={placeholder}
            required={required}
          />
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {renderFieldErrors(field.state.meta.errors)}
        </div>
      )}
    </form.AppField>
  );

  const renderTextAreaField = (
    fieldName: keyof IssueClaimFormData,
    label: string,
    { description }: { description?: string } = {}
  ) => (
    <form.AppField name={fieldName as string}>
      {(field) => (
        <div className="space-y-2">
          <Label htmlFor={fieldName as string}>{label}</Label>
          <Textarea
            id={fieldName as string}
            value={(field.state.value as string | undefined) ?? ""}
            onChange={(event) => {
              field.handleChange(event.target.value);
            }}
          />
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {renderFieldErrors(field.state.meta.errors)}
        </div>
      )}
    </form.AppField>
  );

  const renderDateTimeField = (
    fieldName: keyof IssueClaimFormData,
    label: string,
    description?: string
  ) => (
    <form.AppField name={fieldName as string}>
      {(field) => (
        <div className="space-y-2">
          <Label htmlFor={fieldName as string}>{label}</Label>
          <Input
            id={fieldName as string}
            type="datetime-local"
            value={toDateTimeValue(field.state.value as string | undefined)}
            onChange={(event) => {
              field.handleChange(fromDateTimeValue(event.target.value));
            }}
          />
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {renderFieldErrors(field.state.meta.errors)}
        </div>
      )}
    </form.AppField>
  );

  const renderTextClaimField = () =>
    renderTextField("claimValue", t("actions.issueClaim.fields.claimValue"), {
      description: t("actions.issueClaim.fields.claimValueDescription"),
      placeholder: t("actions.issueClaim.fields.claimValuePlaceholder"),
    });

  const renderCollateralFields = () => (
    <>
      {renderTextField(
        "collateralAmount",
        t("actions.issueClaim.fields.collateralAmount"),
        {
          description: t(
            "actions.issueClaim.fields.collateralAmountDescription"
          ),
          placeholder: COLLATERAL_DEFAULT_PLACEHOLDER,
        }
      )}
      {renderDateTimeField(
        "collateralExpiryTimestamp",
        t("actions.issueClaim.fields.expiryTimestamp"),
        t("actions.issueClaim.fields.expiryTimestampDescription")
      )}
    </>
  );

  const renderAssetClassificationFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {renderTextField(
        "assetClass",
        t("actions.issueClaim.fields.assetClass"),
        {
          required: true,
        }
      )}
      {renderTextField(
        "assetCategory",
        t("actions.issueClaim.fields.assetCategory"),
        {
          required: true,
        }
      )}
    </div>
  );

  const renderBasePriceFields = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {renderTextField(
        "basePriceAmount",
        t("actions.issueClaim.fields.priceAmount")
      )}
      {renderTextField(
        "basePriceCurrencyCode",
        t("actions.issueClaim.fields.currencyCode"),
        { placeholder: "USD" }
      )}
      {renderTextField(
        "basePriceDecimals",
        t("actions.issueClaim.fields.decimals"),
        { placeholder: "2", type: "number" }
      )}
    </div>
  );

  const renderIssuerLicensedFields = () => (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {renderTextField(
          "licenseType",
          t("actions.issueClaim.fields.licenseType"),
          { required: true }
        )}
        {renderTextField(
          "licenseNumber",
          t("actions.issueClaim.fields.licenseNumber"),
          { required: true }
        )}
        {renderTextField(
          "licenseJurisdiction",
          t("actions.issueClaim.fields.licenseJurisdiction"),
          { required: true }
        )}
      </div>
      {renderDateTimeField(
        "licenseValidUntil",
        t("actions.issueClaim.fields.validUntil")
      )}
    </>
  );

  const renderIssuerReportingFields = () => (
    <>
      <form.AppField name="reportingCompliant">
        {(field) => (
          <div className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Label className="text-base" htmlFor="reporting-compliant">
                {t("actions.issueClaim.fields.reportingCompliant")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("actions.issueClaim.fields.reportingCompliantDescription")}
              </p>
            </div>
            <Switch
              id="reporting-compliant"
              checked={Boolean(field.state.value ?? true)}
              onCheckedChange={(checked) => {
                field.handleChange(checked);
              }}
            />
          </div>
        )}
      </form.AppField>

      {renderDateTimeField(
        "reportingLastUpdated",
        tCommon("chart.update.lastUpdated")
      )}
    </>
  );

  const renderTopicFields = () => {
    if (!selectedTopic) return null;

    if (TEXT_CLAIM_TOPICS.has(selectedTopic)) {
      return renderTextClaimField();
    }

    switch (selectedTopic) {
      case "collateral":
        return renderCollateralFields();
      case "assetClassification":
        return renderAssetClassificationFields();
      case "assetIssuer":
        return renderTextField(
          "issuerAddress",
          t("actions.issueClaim.fields.issuerAddress"),
          { required: true }
        );
      case "basePrice":
        return renderBasePriceFields();
      case "contractIdentity":
        return renderTextField(
          "contractAddress",
          t("actions.issueClaim.fields.contractAddress"),
          { required: true }
        );
      case "isin":
        return renderTextField("isin", t("actions.issueClaim.fields.isin"), {
          placeholder: "US0000000000",
        });
      case "issuerJurisdiction":
        return renderTextAreaField(
          "issuerJurisdiction",
          t("actions.issueClaim.fields.jurisdiction")
        );
      case "issuerLicensed":
        return renderIssuerLicensedFields();
      case "issuerProspectusExempt":
        return renderTextField(
          "exemptionReference",
          t("actions.issueClaim.fields.exemptionReference"),
          { placeholder: "Regulation D 506(b)" }
        );
      case "issuerProspectusFiled":
        return renderTextField(
          "prospectusReference",
          t("actions.issueClaim.fields.prospectusReference"),
          { placeholder: "PROS-2024-001" }
        );
      case "issuerReportingCompliant":
        return renderIssuerReportingFields();
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("actions.issueClaim.customClaimNotSupported")}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="space-y-4">
      <form.AppField name="topic">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="claim-topic">
              {t("actions.issueClaim.fields.claimTopic")}
            </Label>
            <Select
              value={(field.state.value as string | undefined) ?? ""}
              onValueChange={(value) => {
                field.handleChange(value);
                onTopicChange(value as IssueClaimTopic);
              }}
            >
              <SelectTrigger id="claim-topic">
                <SelectValue
                  placeholder={t("actions.issueClaim.fields.selectTopic")}
                />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.name} value={topic.name}>
                    {tComponents(`claimTopics.${topic.name}`, topic.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("actions.issueClaim.fields.topicDescription")}
            </p>
            {renderFieldErrors(field.state.meta.errors)}
          </div>
        )}
      </form.AppField>

      {selectedTopic && !userCanIssueTopic && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("actions.issueClaim.notTrustedIssuer")}
          </AlertDescription>
        </Alert>
      )}

      {selectedTopic && userCanIssueTopic && renderTopicFields()}
    </div>
  );
}
