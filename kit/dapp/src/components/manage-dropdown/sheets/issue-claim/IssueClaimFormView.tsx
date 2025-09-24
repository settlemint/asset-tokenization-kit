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
import type { FormFieldConfig } from "@/lib/utils/claims/claim-schema-builder";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IssueClaimFormData, IssueClaimTopic } from "../issue-claim-sheet";

type AppFormInstance = ReturnType<typeof useAppForm>;

interface IssueClaimFormViewProps {
  form: AppFormInstance;
  topics: Array<{ name: string; signature: string }>;
  values: IssueClaimFormData;
  formFields: FormFieldConfig[];
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
  formFields,
  userCanIssueTopic,
  onTopicChange,
  toDateTimeValue,
  fromDateTimeValue,
}: IssueClaimFormViewProps) {
  const { t } = useTranslation("identities");
  const { t: tComponents } = useTranslation("components");

  const selectedTopic = values.topic;

  const renderDynamicField = (field: FormFieldConfig) => {
    const fieldName = field.name as keyof IssueClaimFormData;

    switch (field.type) {
      case "text":
      case "number":
      case "bigint":
        return (
          <form.AppField key={field.name} name={fieldName as string}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <Input
                  id={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  value={(formField.state.value as string | undefined) ?? ""}
                  onChange={(event) => {
                    formField.handleChange(event.target.value);
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                  min={field.validation?.min}
                  max={field.validation?.max}
                />
                {field.description ? (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                ) : null}
                {renderFieldErrors(formField.state.meta.errors)}
              </div>
            )}
          </form.AppField>
        );

      case "textarea":
        return (
          <form.AppField key={field.name} name={fieldName as string}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <Textarea
                  id={field.name}
                  value={(formField.state.value as string | undefined) ?? ""}
                  onChange={(event) => {
                    formField.handleChange(event.target.value);
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                />
                {field.description ? (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                ) : null}
                {renderFieldErrors(formField.state.meta.errors)}
              </div>
            )}
          </form.AppField>
        );

      case "checkbox":
      case "boolean":
        return (
          <form.AppField key={field.name} name={fieldName as string}>
            {(formField) => (
              <div className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <Label className="text-base" htmlFor={field.name}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.description ? (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                </div>
                <Switch
                  id={field.name}
                  checked={Boolean(formField.state.value ?? false)}
                  onCheckedChange={(checked) => {
                    formField.handleChange(checked);
                  }}
                />
                {renderFieldErrors(formField.state.meta.errors)}
              </div>
            )}
          </form.AppField>
        );

      case "datetime":
        return (
          <form.AppField key={field.name} name={fieldName as string}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <Input
                  id={field.name}
                  type="datetime-local"
                  value={toDateTimeValue(
                    formField.state.value as string | undefined
                  )}
                  onChange={(event) => {
                    formField.handleChange(
                      fromDateTimeValue(event.target.value)
                    );
                  }}
                  required={field.required}
                />
                {field.description ? (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                ) : null}
                {renderFieldErrors(formField.state.meta.errors)}
              </div>
            )}
          </form.AppField>
        );

      case "select":
        return (
          <form.AppField key={field.name} name={fieldName as string}>
            {(formField) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <Select
                  value={(formField.state.value as string | undefined) ?? ""}
                  onValueChange={(value) => {
                    formField.handleChange(value);
                  }}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue
                      placeholder={
                        field.placeholder ||
                        `Select ${field.label.toLowerCase()}`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.validation?.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description ? (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                ) : null}
                {renderFieldErrors(formField.state.meta.errors)}
              </div>
            )}
          </form.AppField>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unsupported field type: {field.type}
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  const renderTopicFields = () => {
    if (!selectedTopic) return null;

    if (formFields.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No form fields available for this topic.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {formFields.map((field) => renderDynamicField(field))}
      </div>
    );
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
