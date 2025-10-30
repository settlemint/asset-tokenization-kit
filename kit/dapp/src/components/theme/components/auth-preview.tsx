import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import type { ThemeConfig } from "../lib/schema";
import {
  resolveAuthLogoSrc,
  resolveBackgroundImage,
} from "./theme-preview-utils";

type ThemeMode = keyof ThemeConfig["cssVars"];

type AuthPreviewProps = {
  draft: ThemeConfig;
  mode: ThemeMode;
  controlStyle: CSSProperties;
  containerStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  welcomeText: string;
  signInText: string;
  emailLabel: string;
  passwordLabel: string;
  signInButtonText: string;
};

export function AuthPreview({
  draft,
  mode,
  controlStyle,
  containerStyle,
  primaryButtonStyle,
  welcomeText,
  signInText,
  emailLabel,
  passwordLabel,
  signInButtonText,
}: AuthPreviewProps) {
  return (
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
              <h3 className="text-lg font-semibold">{welcomeText}</h3>
              <p className="text-sm text-muted-foreground">{signInText}</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">{emailLabel}</Label>
                <Input
                  placeholder="name@example.com"
                  style={controlStyle}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{passwordLabel}</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  style={controlStyle}
                  disabled
                />
              </div>
              <Button className="w-full" style={primaryButtonStyle} disabled>
                {signInButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
