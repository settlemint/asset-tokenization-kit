import { createLogger } from "@settlemint/sdk-utils/logging";
import type { FieldGroup } from "./types";
import { WizardField } from "./wizard-field";

const logger = createLogger();

interface WizardGroupProps<TFormData> {
  group: FieldGroup<TFormData>;
  formData: Partial<TFormData>;
}

export function WizardGroup<TFormData>({
  group,
  formData,
}: WizardGroupProps<TFormData>) {
  logger.debug("WizardGroup render", {
    groupId: group.id,
    fieldsCount: group.fields.length,
  });

  return (
    <div className="space-y-6">
      {/* Group header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {group.icon && (
            <div className="flex-shrink-0 text-muted-foreground">
              {group.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-foreground">{group.label}</h3>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
      </div>

      {/* Group fields */}
      <div className="grid grid-cols-3 gap-4 pl-7">
        {group.fields.map((fieldDef) => {
          try {
            return (
              <WizardField
                key={fieldDef.name as string}
                fieldDef={fieldDef}
                formData={formData}
              />
            );
          } catch (error) {
            logger.error("Error rendering field in group", {
              fieldName: fieldDef.name,
              groupId: group.id,
              error,
            });
            return (
              <div key={fieldDef.name as string} className="text-destructive">
                Error rendering field: {fieldDef.name as string}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
