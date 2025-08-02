import { Button } from "@/components/ui/button";
import { Pencil, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddressFieldToggleProps {
  children: (props: { mode: "select" | "manual" }) => React.ReactNode;
}

export function AddressSelectOrInput({ children }: AddressFieldToggleProps) {
  const { t } = useTranslation("form");
  const [mode, setMode] = useState<"select" | "manual">("select");

  return (
    <div>
      {children({ mode })}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => {
          if (mode === "select") {
            setMode("manual");
          } else {
            setMode("select");
          }
        }}
        className="mt-2 text-xs"
      >
        {mode === "manual" && <Search className="h-3 w-3" />}
        {mode === "select" && <Pencil className="h-3 w-3" />}
        {mode === "select"
          ? t("address.enterManually")
          : t("address.searchInstead")}
      </Button>
    </div>
  );
}
