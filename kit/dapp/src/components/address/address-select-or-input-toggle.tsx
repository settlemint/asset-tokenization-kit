import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddressFieldToggleProps {
  children: (props: { mode: "select" | "manual" }) => React.ReactNode;
}

export function AddressSelectOrInputToggle({
  children,
}: AddressFieldToggleProps) {
  const { t } = useTranslation("form");
  const [mode, setMode] = useState<"select" | "manual">("select");

  return (
    <div>
      {children({ mode })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          if (mode === "select") {
            setMode("manual");
          } else {
            setMode("select");
          }
        }}
        className="text-xs text-muted"
      >
        {mode === "select"
          ? t("address.enterManually")
          : t("address.searchInstead")}
      </Button>
    </div>
  );
}
