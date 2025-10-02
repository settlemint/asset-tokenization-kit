import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddressFieldToggleProps {
  children: (props: { mode: "select" | "manual" }) => React.ReactNode;
  allowManual?: boolean;
}

export function AddressSelectOrInputToggle({
  children,
  allowManual = true,
}: AddressFieldToggleProps) {
  const { t } = useTranslation("form");
  const [mode, setMode] = useState<"select" | "manual">("select");

  const currentMode = allowManual ? mode : "select";

  return (
    <div>
      {children({ mode: currentMode })}
      {allowManual && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setMode((prev) => (prev === "select" ? "manual" : "select"));
          }}
          className="text-xs text-muted"
        >
          {mode === "select"
            ? t("address.enterManually")
            : t("address.searchInstead")}
        </Button>
      )}
    </div>
  );
}
