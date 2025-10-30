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
import type { ThemeConfig, ThemeToken } from "../lib/schema";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import type { CSSProperties } from "react";
import { FONT_PREVIEW_TEXT } from "../lib/constants";
import type { ThemeTranslateFn } from "../lib/types";

// Map derived shadcn variables so previews ignore the page-level theme class.
const PREVIEW_DERIVED_VARIABLES = {
  background: "sm-background-lightest",
  foreground: "sm-text",
  card: "sm-colored-shadow",
  "card-foreground": "sm-text",
  popover: "sm-background-lightest",
  "popover-foreground": "sm-text",
  primary: "sm-accent",
  "primary-foreground": "sm-text-contrast",
  secondary: "sm-graphics-primary",
  "secondary-foreground": "sm-text",
  muted: "sm-colored-shadow",
  "muted-foreground": "sm-muted",
  accent: "sm-accent",
  "accent-foreground": "sm-text-contrast",
  "accent-hover": "sm-accent-hover",
  destructive: "sm-state-error-background",
  "destructive-foreground": "sm-state-error",
  success: "sm-state-success-background",
  "success-foreground": "sm-state-success",
  "success-fg-deep": "sm-state-success-fg-deep",
  warning: "sm-state-warning-background",
  "warning-foreground": "sm-state-warning",
  border: "sm-border",
  input: "sm-border",
  ring: "sm-accent",
  "chart-1": "sm-graphics-primary",
  "chart-2": "sm-graphics-quaternary",
  "chart-3": "sm-graphics-tertiary",
  "chart-4": "sm-graphics-secondary",
  "chart-5": "sm-accent",
  "chart-6": "sm-state-warning-background",
  sidebar: "sm-background-darkest",
  "sidebar-foreground": "sm-text",
  "sidebar-primary": "sm-accent",
  "sidebar-primary-foreground": "sm-text",
  "sidebar-accent": "sm-background-gradient-start",
  "sidebar-accent-foreground": "sm-text",
  "sidebar-border": "sm-border",
  "sidebar-ring": "sm-accent",
} as const satisfies Record<string, ThemeToken>;

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
      title: t("lightPreviewTab"),
    },
    {
      mode: "dark",
      title: t("darkPreviewTab"),
    },
  ];

  return (
    <aside className="mt-6 space-y-4 xl:mt-0 xl:space-y-6 order-2">
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{t("previewTitle")}</CardTitle>
          <CardDescription>{t("previewDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="light" className="space-y-6">
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
                    data-theme={mode}
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
                            {t("previewHeading")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("previewSubheading")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button style={primaryButtonStyle}>
                          {t("previewButton")}
                        </Button>
                        <Button variant="outline" style={secondaryButtonStyle}>
                          {t("previewSecondary")}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide">
                          {t("previewInputLabel")}
                        </Label>
                        <Input placeholder="0x1234…abcd" style={controlStyle} />
                      </div>
                      <div className="rounded-lg border bg-card/80 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Paintbrush className="size-4" />
                          <span>{t("previewSwatchHeading")}</span>
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

                  {/* Authentication Page Preview */}
                  <div className="mt-6">
                    <div
                      className={cn(
                        "relative min-h-[480px] rounded-xl border overflow-hidden",
                        mode === "dark" && "dark"
                      )}
                      data-mode={mode}
                      data-theme={mode}
                      style={{
                        ...containerStyle,
                        backgroundImage: resolveBackgroundImage(draft, mode),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Auth Logo */}
                      <div className="absolute top-6 left-6 z-10">
                        <img
                          src={resolveAuthLogoSrc(draft, mode)}
                          alt={draft.logo.alt ?? "Logo"}
                          className="h-10 w-auto object-contain drop-shadow-sm"
                        />
                      </div>

                      {/* Login Card */}
                      <div className="flex items-center justify-center min-h-[480px] p-6 pt-20">
                        <div
                          className="w-full max-w-sm rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg p-6 space-y-4"
                          style={containerStyle}
                        >
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              Welcome back
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sign in to your account
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Email</Label>
                              <Input
                                placeholder="name@example.com"
                                style={controlStyle}
                                disabled
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Password</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                style={controlStyle}
                                disabled
                              />
                            </div>
                            <Button
                              className="w-full"
                              style={primaryButtonStyle}
                              disabled
                            >
                              Sign in
                            </Button>
                          </div>
                        </div>
                      </div>
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

function createPreviewStyle(theme: ThemeConfig, mode: ThemeMode): CSSVarStyle {
  const style: CSSVarStyle = {
    fontFamily: theme.fonts.sans.family,
  };

  const modeVars = theme.cssVars[mode];

  for (const [token, value] of Object.entries(modeVars)) {
    style[`--${token}`] = value;
  }

  for (const [cssVar, sourceToken] of Object.entries(
    PREVIEW_DERIVED_VARIABLES
  )) {
    style[`--${cssVar}`] = modeVars[sourceToken];
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
  const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";

  if (trimmedValue.length > 0) {
    return trimmedValue;
  }

  if (mode === "dark") {
    const lightRaw = theme.logo.lightUrl;
    const lightTrimmed = typeof lightRaw === "string" ? lightRaw.trim() : "";
    if (lightTrimmed.length > 0) {
      return lightTrimmed;
    }
  }

  return fallback;
}

function resolveAuthLogoSrc(theme: ThemeConfig, mode: ThemeMode): string {
  const authKey = mode === "light" ? "authLightUrl" : "authDarkUrl";
  const logoKey = mode === "light" ? "lightUrl" : "darkUrl";
  const fallback =
    mode === "light"
      ? "/logos/settlemint-logo-h-lm.svg"
      : "/logos/settlemint-logo-h-dm.svg";

  // Try auth logo first
  const authValue = theme.images[authKey];
  const trimmedAuth = typeof authValue === "string" ? authValue.trim() : "";
  if (trimmedAuth.length > 0) {
    return trimmedAuth;
  }

  // Fall back to application logo
  const logoValue = theme.logo[logoKey];
  const trimmedLogo = typeof logoValue === "string" ? logoValue.trim() : "";
  if (trimmedLogo.length > 0) {
    return trimmedLogo;
  }

  return fallback;
}

function resolveBackgroundImage(theme: ThemeConfig, mode: ThemeMode): string {
  const key = mode === "light" ? "backgroundLightUrl" : "backgroundDarkUrl";
  const fallback =
    mode === "light"
      ? "/backgrounds/background-lm.svg"
      : "/backgrounds/background-dm.svg";

  const rawValue = theme.images[key];
  const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";

  if (trimmedValue.length > 0) {
    return `url(${trimmedValue})`;
  }

  return `url(${fallback})`;
}
