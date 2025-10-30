import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import type { RefObject } from "react";
import type { ThemeLogoMode } from "@/orpc/routes/settings/routes/theme.upload-logo.schema";

type UploadFieldProps = {
  mode: ThemeLogoMode;
  inputRef: RefObject<HTMLInputElement | null>;
  onPickFile: (mode: ThemeLogoMode) => void;
  onFileSelected: (mode: ThemeLogoMode, file: File | null) => void;
  disabled: boolean;
  buttonLabel: string;
  accept?: string;
};

export function UploadField({
  mode,
  inputRef,
  onPickFile,
  onFileSelected,
  disabled,
  buttonLabel,
  accept = "image/svg+xml,image/png,image/jpeg,image/webp",
}: UploadFieldProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onPickFile(mode);
          }}
          disabled={disabled}
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Button>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onFileSelected(mode, file);
          e.target.value = "";
        }}
      />
    </>
  );
}
