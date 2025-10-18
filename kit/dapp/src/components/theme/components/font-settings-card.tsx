import { DEFAULT_THEME, type ThemeConfig } from "../lib/schema";
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
import { FONT_PREVIEW_TEXT } from "../lib/constants";
import type { ThemeFormApi, ThemeTranslateFn } from "../lib/types";
import { useGoogleFontsCatalog } from "../hooks/use-google-fonts";

const FONT_SOURCE_OPTIONS: Array<{
  value: ThemeConfig["fonts"]["sans"]["source"];
  labelKey:
    | "fontSourceOptionFontsource"
    | "fontSourceOptionGoogle"
    | "fontSourceOptionCustom";
}> = [
  {
    value: "fontsource",
    labelKey: "fontSourceOptionFontsource",
  },
  {
    value: "google",
    labelKey: "fontSourceOptionGoogle",
  },
  {
    value: "custom",
    labelKey: "fontSourceOptionCustom",
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
      title: t("fontSansTitle"),
      description: t("fontSansDescription"),
    },
    {
      key: "mono",
      title: t("fontMonoTitle"),
      description: t("fontMonoDescription"),
    },
  ];

  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>{t("fontsTitle")}</CardTitle>
        <CardDescription>{t("fontsDescription")}</CardDescription>
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
                          <Label>{t("fontSourceLabel")}</Label>
                          <Select
                            value={sourceValue}
                            onValueChange={(value) => {
                              const typedValue =
                                value as ThemeConfig["fonts"]["sans"]["source"];
                              field.handleChange(typedValue);

                              if (typedValue === "fontsource") {
                                const defaults = DEFAULT_THEME.fonts[key];
                                form.setFieldValue(
                                  `fonts.${key}.family`,
                                  defaults.family
                                );
                                form.setFieldValue(
                                  `fonts.${key}.weights`,
                                  defaults.weights ?? undefined
                                );
                                form.setFieldValue(
                                  `fonts.${key}.url`,
                                  undefined
                                );
                                form.setFieldValue(
                                  `fonts.${key}.preload`,
                                  defaults.preload
                                );
                              } else if (typedValue !== "custom") {
                                form.setFieldValue(
                                  `fonts.${key}.url`,
                                  undefined
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="justify-start text-left px-3 py-2">
                              <SelectValue
                                placeholder={t("fontSourcePlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_SOURCE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span>{t(option.labelKey)}</span>
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
                      {t("fontDefaultInfo")}
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
                              <Label>{t("fontFamilyLabel")}</Label>
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
                                      placeholder={t("fontGooglePlaceholder")}
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
                                <Label>{t("fontUrlLabel")}</Label>
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
                              <Label>{t("fontWeightsLabel")}</Label>
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
                                {t("fontWeightsHelper")}
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
                                  {t("fontPreloadLabel")}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {t("fontPreloadDescription")}
                                </p>
                              </div>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={(checkedValue) => {
                                  field.handleChange(checkedValue);
                                }}
                                aria-label={t("fontPreloadLabel")}
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
                    {t("fontPreviewLabel")}
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
                      {t("fontGoogleHint")}
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
