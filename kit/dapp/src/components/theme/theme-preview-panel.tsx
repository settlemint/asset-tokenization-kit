import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ThemeConfig } from "@/components/theme/schema";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import type { CSSProperties } from "react";
import { FONT_PREVIEW_TEXT } from "./constants";
import type { ThemeTranslateFn } from "./types";

type ThemeMode = keyof ThemeConfig["cssVars"];

type CSSVarStyle = CSSProperties & Record<string, string | number>;

type ThemePreviewPanelProps = {
  draft: ThemeConfig;
  t: ThemeTranslateFn;
};

export function ThemePreviewPanel({ draft, t }: ThemePreviewPanelProps) {
  const tabs: Array<{ mode: ThemeMode; title: string }> = [
    {
      mode: "light",
      title: t("settings.theme.lightPreviewTab", "Light preview"),
    },
    {
      mode: "dark",
      title: t("settings.theme.darkPreviewTab", "Dark preview"),
    },
  ];

  return (
    <aside className="mt-6 space-y-4 lg:mt-0 lg:space-y-6">
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>
            {t("settings.theme.previewTitle", "Live preview")}
          </CardTitle>
          <CardDescription>
            {t(
              "settings.theme.previewDescription",
              "Inspect core UI elements using the configured theme tokens."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="light" className="space-y-4">
            <TabsList>
              {tabs.map(({ mode, title }) => (
                <TabsTrigger key={mode} value={mode}>
                  {title}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(({ mode }) => {
              const previewVars = createPreviewStyle(draft, mode);
              const containerStyle: CSSVarStyle = {
                ...previewVars,
                colorScheme: mode,
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
              };
              const logoSrc = resolvePreviewLogoSrc(draft, mode);
              const primaryButtonStyle: CSSProperties = {
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                borderColor: "var(--primary)",
              };
              const secondaryButtonStyle: CSSProperties = {
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                borderColor: "var(--border)",
              };
              const controlStyle: CSSProperties = {
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
              };
              return (
                <TabsContent key={mode} value={mode}>
                  <div
                    className={cn(
                      "theme-preview-surface rounded-xl border bg-background text-foreground shadow-sm",
                      mode === "dark" && "dark"
                    )}
                    data-mode={mode}
                    style={containerStyle}
                  >
                    <div className="border-b px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full border bg-card p-1">
                          <img
                            src={logoSrc}
                            alt={draft.logo.alt ?? "Logo"}
                            className="size-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {t(
                              "settings.theme.previewHeading",
                              "SettleMint Portal"
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "settings.theme.previewSubheading",
                              "Sample components rendered with live tokens."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button style={primaryButtonStyle}>
                          {t("settings.theme.previewButton", "Primary action")}
                        </Button>
                        <Button variant="outline" style={secondaryButtonStyle}>
                          {t(
                            "settings.theme.previewSecondary",
                            "Secondary action"
                          )}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide">
                          {t(
                            "settings.theme.previewInputLabel",
                            "Example input"
                          )}
                        </Label>
                        <Input
                          placeholder="0x1234…abcd"
                          style={controlStyle}
                        />
                      </div>
                      <div className="rounded-lg border bg-card/80 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Paintbrush className="size-4" />
                          <span>
                            {t(
                              "settings.theme.previewSwatchHeading",
                              "Palette snapshot"
                            )}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[
                            "primary",
                            "accent",
                            "success",
                            "warning",
                            "destructive",
                            "muted",
                          ].map((token) => (
                            <div key={token} className="space-y-1">
                              <div
                                className="h-10 rounded-md border"
                                style={{
                                  background: `var(--${token})`,
                                }}
                              />
                              <p className="text-[11px] text-muted-foreground">
                                {token}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        readOnly
                        value={FONT_PREVIEW_TEXT}
                        className="font-mono"
                        style={controlStyle}
                      />
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </aside>
  );
}

function createPreviewStyle(
  theme: ThemeConfig,
  mode: ThemeMode
): CSSVarStyle {
  const style: CSSVarStyle = {
    fontFamily: theme.fonts.sans.family,
  };

  for (const [token, value] of Object.entries(theme.cssVars[mode])) {
    style[`--${token}`] = value;
  }

  return style;
}

function resolvePreviewLogoSrc(theme: ThemeConfig, mode: ThemeMode): string {
  const key = mode === "light" ? "lightUrl" : "darkUrl";
  const fallback =
    mode === "light"
      ? "/logos/settlemint-logo-h-lm.svg"
      : "/logos/settlemint-logo-h-dm.svg";
  const rawValue = theme.logo[key];
  const trimmedValue =
    typeof rawValue === "string" ? rawValue.trim() : "";

  if (trimmedValue.length > 0) {
    return trimmedValue;
  }

  if (mode === "dark") {
    const lightRaw = theme.logo.lightUrl;
    const lightTrimmed =
      typeof lightRaw === "string" ? lightRaw.trim() : "";
    if (lightTrimmed.length > 0) {
      return lightTrimmed;
    }
  }

  return fallback;
}
