import { Button } from "@/components/ui/button";
import { AddressSearchScope } from "@/hooks/use-search-addresses";
import { Pencil, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddressInputField } from "./address-input-field";
import { AddressSelectField } from "./address-select-field";

interface AddressFieldToggleProps {
  label: string;
  description?: string;
  required?: boolean;
  scope: AddressSearchScope;
  defaultMode?: "select" | "manual";
}

export function AddressSelectOrInputField({
  label,
  description,
  required = false,
  scope,
  defaultMode = "select",
}: AddressFieldToggleProps) {
  const { t } = useTranslation("form");
  const [mode, setMode] = useState<"select" | "manual">(defaultMode);

  // Switch to manual mode
  const switchToManualMode = useCallback(() => {
    setMode("manual");
  }, []);

  // Switch to search mode
  const switchToSelectMode = useCallback(() => {
    setMode("select");
  }, []);

  if (mode === "manual") {
    return (
      <div className="space-y-2">
        <AddressInputField
          key={mode}
          label={label}
          description={description}
          required={required}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={switchToSelectMode}
          className="text-xs"
        >
          <Search className="mr-2 h-3 w-3" />
          {t("address.searchInstead")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AddressSelectField
        key={mode}
        label={label}
        description={description}
        required={required}
        scope={scope}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={switchToManualMode}
        className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
      >
        <Pencil className="mr-2 h-3 w-3" />
        {t("address.enterManually")}
      </Button>
    </div>
  );
}
