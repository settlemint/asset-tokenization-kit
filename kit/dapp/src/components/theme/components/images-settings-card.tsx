import type { ThemeConfig } from "../lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageIcon, UploadCloud } from "lucide-react";
import type { RefObject } from "react";
import type { ThemeFormApi, ThemeTranslateFn } from "../lib/types";
import type { ThemeLogoMode } from "@/orpc/routes/settings/routes/theme.upload-logo.schema";

type ImagesSettingsCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  draft: ThemeConfig;
  baseTheme: ThemeConfig;
  onPickFile: (mode: ThemeLogoMode) => void;
  onFileSelected: (mode: ThemeLogoMode, file: File | null) => void;
  authLightInputRef: RefObject<HTMLInputElement | null>;
  authDarkInputRef: RefObject<HTMLInputElement | null>;
  backgroundLightInputRef: RefObject<HTMLInputElement | null>;
  backgroundDarkInputRef: RefObject<HTMLInputElement | null>;
  faviconInputRef: RefObject<HTMLInputElement | null>;
  uploadStatus: Record<ThemeLogoMode, boolean>;
  t: ThemeTranslateFn;
};

export function ImagesSettingsCard({
  sectionId,
  form,
  baseTheme,
  onPickFile,
  onFileSelected,
  authLightInputRef,
  authDarkInputRef,
  backgroundLightInputRef,
  backgroundDarkInputRef,
  faviconInputRef,
  uploadStatus,
  t,
}: ImagesSettingsCardProps) {
  const resolveImageField = (
    mode: ThemeLogoMode
  ):
    | "authLightUrl"
    | "authDarkUrl"
    | "backgroundLightUrl"
    | "backgroundDarkUrl"
    | "faviconUrl" => {
    switch (mode) {
      case "authLight":
        return "authLightUrl";
      case "authDark":
        return "authDarkUrl";
      case "backgroundLight":
        return "backgroundLightUrl";
      case "backgroundDark":
        return "backgroundDarkUrl";
      case "favicon":
        return "faviconUrl";
      default:
        return "faviconUrl";
    }
  };

  const imageModes: Array<{
    mode: ThemeLogoMode;
    title: string;
    description: string;
    backgroundClass: string;
    fallback?: string;
    inputRef: RefObject<HTMLInputElement | null>;
  }> = [
    {
      mode: "authLight" as ThemeLogoMode,
      title: t("authLightLabel"),
      description: t("authLightDescription"),
      backgroundClass: "bg-white border border-border",
      fallback: undefined,
      inputRef: authLightInputRef,
    },
    {
      mode: "authDark" as ThemeLogoMode,
      title: t("authDarkLabel"),
      description: t("authDarkDescription"),
      backgroundClass: "bg-zinc-900 border border-zinc-700",
      fallback: undefined,
      inputRef: authDarkInputRef,
    },
    {
      mode: "backgroundLight" as ThemeLogoMode,
      title: t("backgroundLightLabel"),
      description: t("backgroundLightDescription"),
      backgroundClass: "bg-white border border-border",
      fallback: "/backgrounds/background-lm.svg",
      inputRef: backgroundLightInputRef,
    },
    {
      mode: "backgroundDark" as ThemeLogoMode,
      title: t("backgroundDarkLabel"),
      description: t("backgroundDarkDescription"),
      backgroundClass: "bg-zinc-900 border border-zinc-700",
      fallback: "/backgrounds/background-dm.svg",
      inputRef: backgroundDarkInputRef,
    },
    {
      mode: "favicon" as ThemeLogoMode,
      title: t("faviconLabel"),
      description: t("faviconDescription"),
      backgroundClass: "bg-white border border-border",
      fallback: "/favicon.ico",
      inputRef: faviconInputRef,
    },
  ];

  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>{t("imagesSectionTitle")}</CardTitle>
        <CardDescription>{t("imagesSectionDescription")}</CardDescription>
        <CardDescription>{t("imagePreviewHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {imageModes.map(
            ({
              mode,
              title,
              description,
              backgroundClass,
              fallback,
              inputRef,
            }) => {
              const imageField = resolveImageField(mode);
              const fieldName = `images.${imageField}` as const;
              const fileInputRef = inputRef;
              const isUploading = uploadStatus[mode] ?? false;
              return (
                <form.Field key={mode} name={fieldName}>
                  {(field) => {
                    const currentUrl =
                      typeof field.state.value === "string"
                        ? field.state.value
                        : "";
                    const defaultUrl = baseTheme.images[imageField] ?? "";
                    const displayUrl =
                      currentUrl.length > 0
                        ? currentUrl
                        : defaultUrl.length > 0
                          ? defaultUrl
                          : (fallback ?? "");
                    return (
                      <div className="space-y-3 rounded-lg border p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ImageIcon className="size-4" />
                            <span>{title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {description}
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                          <div className="space-y-3">
                            <Input
                              value={currentUrl}
                              onChange={(event) => {
                                field.handleChange(event.target.value);
                              }}
                              placeholder={t("logoUrlPlaceholder")}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  onPickFile(mode);
                                }}
                                disabled={isUploading}
                              >
                                <UploadCloud className="mr-2 size-4" />
                                {t("imageUploadButton")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  field.handleChange(defaultUrl);
                                }}
                              >
                                {t("imageResetButton")}
                              </Button>
                              <input
                                ref={fileInputRef}
                                className="hidden"
                                type="file"
                                accept="image/svg+xml,image/png,image/webp,image/ico,image/x-icon"
                                disabled={isUploading}
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  onFileSelected(mode, file);
                                  event.target.value = "";
                                }}
                              />
                            </div>
                          </div>
                          {displayUrl.length > 0 ? (
                            <div className="space-y-2">
                              <div
                                className={cn(
                                  "flex h-24 items-center justify-center rounded-md overflow-hidden py-2 px-4",
                                  backgroundClass
                                )}
                              >
                                <img
                                  src={displayUrl}
                                  alt={title}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  }}
                </form.Field>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
