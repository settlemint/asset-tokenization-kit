import type { ThemeConfig } from "@/components/theme/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useStore } from "@tanstack/react-form";
import { Type } from "lucide-react";
import { FONT_PREVIEW_TEXT } from "./constants";
import type { ThemeFormApi, ThemeTranslateFn } from "./types";
import { useGoogleFontsCatalog } from "./use-google-fonts";

const FONT_SOURCE_OPTIONS: Array<{
  value: ThemeConfig["fonts"]["sans"]["source"];
  label: string;
}> = [
  {
    value: "fontsource",
    label: "Default",
  },
  {
    value: "google",
    label: "Google Fonts",
  },
  {
    value: "custom",
    label: "Custom CSS URL",
  },
];

type FontSettingsCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  draft: ThemeConfig;
  t: ThemeTranslateFn;
};

export function FontSettingsCard({
  sectionId,
  form,
  draft,
  t,
}: FontSettingsCardProps) {
  const fontsState = useStore(
    form.store,
    (state) => (state as { values: ThemeConfig }).values.fonts
  );
  const { sans: googleSansFonts, mono: googleMonoFonts } =
    useGoogleFontsCatalog();
  const fontEntries: Array<{
    key: keyof ThemeConfig["fonts"];
    title: string;
    description: string;
  }> = [
    {
      key: "sans",
      title: t("settings.theme.fontSansTitle", "Sans-serif Typeface"),
      description: t(
        "settings.theme.fontSansDescription",
        "Primary font used for most UI content."
      ),
    },
    {
      key: "mono",
      title: t("settings.theme.fontMonoTitle", "Monospace Typeface"),
      description: t(
        "settings.theme.fontMonoDescription",
        "Used for code blocks, addresses, and numeric readouts."
      ),
    },
  ];

  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>{t("settings.theme.fontsTitle", "Typography")}</CardTitle>
        <CardDescription>
          {t(
            "settings.theme.fontsDescription",
            "Select font sources, families, and weights for sans-serif and monospace styles."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fontEntries.map(({ key, title, description }) => {
          const currentFont = fontsState?.[key] ?? draft.fonts[key];
          const currentSource = currentFont.source;
          const isDefaultSource = currentSource === "fontsource";
          const isGoogleSource = currentSource === "google";
          const isCustomSource = currentSource === "custom";
          const previewMonoFamily =
            fontsState?.mono?.family ?? draft.fonts.mono.family;

          return (
            <div key={key} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Type className="size-4" />
                <span>{title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
                <div className="space-y-4">
                  <form.Field name={`fonts.${key}.source` as const}>
                    {(field) => {
                      const sourceValue = (field.state.value ??
                        currentSource) as ThemeConfig["fonts"]["sans"]["source"];
                      return (
                        <div className="space-y-2">
                          <Label>
                            {t("settings.theme.fontSourceLabel", "Font source")}
                          </Label>
                          <Select
                            value={sourceValue}
                            onValueChange={(value) => {
                              field.handleChange(
                                value as ThemeConfig["fonts"]["sans"]["source"]
                              );
                            }}
                          >
                            <SelectTrigger className="justify-start text-left px-3 py-2">
                              <SelectValue
                                placeholder={t(
                                  "settings.theme.fontSourcePlaceholder",
                                  "Select font source"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_SOURCE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }}
                  </form.Field>

                  {isDefaultSource ? (
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "settings.theme.fontDefaultInfo",
                        "Using the bundled font. No additional configuration available."
                      )}
                    </p>
                  ) : (
                    <>
                      <form.Field name={`fonts.${key}.family` as const}>
                        {(field) => {
                          const familyValue =
                            typeof field.state.value === "string"
                              ? field.state.value
                              : "";
                          const availableFontOptions =
                            key === "mono" ? googleMonoFonts : googleSansFonts;
                          const missingGoogleOption =
                            isGoogleSource &&
                            familyValue.length > 0 &&
                            !availableFontOptions.includes(familyValue);

                          return (
                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "settings.theme.fontFamilyLabel",
                                  "Font family"
                                )}
                              </Label>
                              {isGoogleSource ? (
                                <Select
                                  value={
                                    familyValue.length > 0
                                      ? familyValue
                                      : undefined
                                  }
                                  onValueChange={(value) => {
                                    field.handleChange(value);
                                  }}
                                >
                                  <SelectTrigger className="justify-start text-left">
                                    <SelectValue
                                      placeholder={t(
                                        "settings.theme.fontGooglePlaceholder",
                                        "Select a Google font"
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFontOptions.map((fontName) => (
                                      <SelectItem
                                        key={fontName}
                                        value={fontName}
                                      >
                                        {fontName}
                                      </SelectItem>
                                    ))}
                                    {missingGoogleOption ? (
                                      <SelectItem value={familyValue}>
                                        {familyValue}
                                      </SelectItem>
                                    ) : null}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={familyValue}
                                  onChange={(event) => {
                                    field.handleChange(event.target.value);
                                  }}
                                  placeholder="Figtree"
                                />
                              )}
                            </div>
                          );
                        }}
                      </form.Field>

                      {isCustomSource ? (
                        <form.Field name={`fonts.${key}.url` as const}>
                          {(field) => {
                            const urlValue =
                              typeof field.state.value === "string"
                                ? field.state.value
                                : "";
                            return (
                              <div className="space-y-2">
                                <Label>
                                  {t(
                                    "settings.theme.fontUrlLabel",
                                    "Custom stylesheet URL"
                                  )}
                                </Label>
                                <Input
                                  value={urlValue}
                                  onChange={(event) => {
                                    field.handleChange(event.target.value);
                                  }}
                                  placeholder="https://cdn.example.com/fonts.css"
                                />
                              </div>
                            );
                          }}
                        </form.Field>
                      ) : null}

                      <form.Field name={`fonts.${key}.weights` as const}>
                        {(field) => {
                          const weightsArray = Array.isArray(field.state.value)
                            ? field.state.value
                            : [];
                          const displayValue = weightsArray
                            .map(Number)
                            .filter((num) => Number.isInteger(num))
                            .map(String)
                            .join(", ");
                          return (
                            <div className="space-y-2">
                              <Label>
                                {t(
                                  "settings.theme.fontWeightsLabel",
                                  "Font weights"
                                )}
                              </Label>
                              <Input
                                value={displayValue}
                                onChange={(event) => {
                                  const weights = event.target.value
                                    .split(/[,\s]+/)
                                    .map((part) => part.trim())
                                    .filter(Boolean)
                                    .map((part) => Number.parseInt(part, 10))
                                    .filter((num) => Number.isInteger(num));
                                  field.handleChange(
                                    weights.length > 0 ? weights : undefined
                                  );
                                }}
                                placeholder="400, 500, 700"
                              />
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  "settings.theme.fontWeightsHelper",
                                  "Enter numeric weights separated by commas. Leave blank for defaults."
                                )}
                              </p>
                            </div>
                          );
                        }}
                      </form.Field>

                      <form.Field name={`fonts.${key}.preload` as const}>
                        {(field) => {
                          const isChecked = field.state.value === true;
                          return (
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                              <div className="space-y-0.5">
                                <span className="text-sm font-medium">
                                  {t(
                                    "settings.theme.fontPreloadLabel",
                                    "Preload font"
                                  )}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {t(
                                    "settings.theme.fontPreloadDescription",
                                    'Injects <link rel="preload"> to prioritize loading.'
                                  )}
                                </p>
                              </div>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={(checkedValue) => {
                                  field.handleChange(checkedValue);
                                }}
                                aria-label={t(
                                  "settings.theme.fontPreloadLabel",
                                  "Preload font"
                                )}
                              />
                            </div>
                          );
                        }}
                      </form.Field>
                    </>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("settings.theme.fontPreviewLabel", "Preview")}
                  </p>
                  <p
                    className="text-base leading-relaxed"
                    style={{ fontFamily: currentFont.family }}
                  >
                    {FONT_PREVIEW_TEXT}
                  </p>
                  <code
                    className="block rounded bg-background/80 px-2 py-1 text-xs"
                    style={{ fontFamily: previewMonoFamily }}
                  >
                    {`font-family: ${currentFont.family};`}
                  </code>
                  {isGoogleSource ? (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {t(
                        "settings.theme.fontGoogleHint",
                        "Select a font family from the dropdown to load it from Google Fonts."
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
