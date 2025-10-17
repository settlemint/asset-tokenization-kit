import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form/tanstack-form";
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

type LogoSettingsCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  draft: ThemeConfig;
  baseTheme: ThemeConfig;
  onPickFile: (mode: "light" | "dark") => void;
  onFileSelected: (mode: "light" | "dark", file: File | null) => void;
  lightInputRef: RefObject<HTMLInputElement | null>;
  darkInputRef: RefObject<HTMLInputElement | null>;
  t: ThemeTranslateFn;
};

export function LogoSettingsCard({
  sectionId,
  form,
  draft,
  baseTheme,
  onPickFile,
  onFileSelected,
  lightInputRef,
  darkInputRef,
  t,
}: LogoSettingsCardProps) {
  const logoModes: Array<{
    mode: "light" | "dark";
    title: string;
    description: string;
    backgroundClass: string;
  }> = [
    {
      mode: "light",
      title: t("logoLightLabel"),
      description: t("logoLightDescription"),
      backgroundClass: "bg-white border border-border",
    },
    {
      mode: "dark",
      title: t("logoDarkLabel"),
      description: t("logoDarkDescription"),
      backgroundClass: "bg-zinc-900 border border-zinc-700",
    },
  ];

  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>{t("logoSectionTitle")}</CardTitle>
        <CardDescription>{t("logoSectionDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form.AppField
          name="logo.alt"
          validators={{
            onChange: ({ value }) => {
              if (typeof value === "string" && value.length > 200) {
                return t("logoAltError");
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const value =
              typeof field.state.value === "string" ? field.state.value : "";
            return (
              <FormItem>
                <FormLabel>{t("logoAltLabel")}</FormLabel>
                <FormControl>
                  <Input
                    value={value}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder={t("logoAltPlaceholder")}
                  />
                </FormControl>
                <FormDescription>{t("logoAltHelper")}</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        </form.AppField>

        <div className="space-y-6">
          {logoModes.map(({ mode, title, description, backgroundClass }) => {
            const fieldName =
              mode === "light" ? "logo.lightUrl" : "logo.darkUrl";
            const fileInputRef =
              mode === "light" ? lightInputRef : darkInputRef;
            return (
              <form.Field key={mode} name={fieldName}>
                {(field) => {
                  const currentUrl =
                    typeof field.state.value === "string"
                      ? field.state.value
                      : "";
                  const defaultUrl =
                    baseTheme.logo[mode === "light" ? "lightUrl" : "darkUrl"] ??
                    "";
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
                            >
                              <UploadCloud className="mr-2 size-4" />
                              {t("logoUploadButton")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                field.handleChange(defaultUrl);
                              }}
                            >
                              {t("logoResetButton")}
                            </Button>
                            <input
                              ref={fileInputRef}
                              className="hidden"
                              type="file"
                              accept="image/svg+xml,image/png,image/webp"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                onFileSelected(mode, file);
                                event.target.value = "";
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div
                            className={cn(
                              "flex h-32 items-center justify-center rounded-md overflow-hidden p-2",
                              backgroundClass
                            )}
                          >
                            <img
                              src={
                                currentUrl.length > 0
                                  ? currentUrl
                                  : defaultUrl.length > 0
                                    ? defaultUrl
                                    : mode === "light"
                                      ? "/logos/settlemint-logo-h-lm.svg"
                                      : "/logos/settlemint-logo-h-dm.svg"
                              }
                              alt={
                                draft.logo.alt ?? baseTheme.logo.alt ?? "Logo"
                              }
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {t("logoPreviewHint")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </form.Field>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
