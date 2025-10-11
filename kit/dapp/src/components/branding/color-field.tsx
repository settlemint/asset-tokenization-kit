"use client";

import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import * as React from "react";

interface ColorFieldProps {
  label: string;
  description: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** CSS variable name to show fallback color when value is null */
  cssVariable?: string;
}

/**
 * ColorField Component
 *
 * Enhanced color picker with label, description, and live preview.
 * Shows the actual color being used with a visual swatch.
 */
export function ColorField({
  label,
  description,
  value,
  onChange,
  placeholder,
  cssVariable,
}: ColorFieldProps) {
  const { resolvedTheme } = useTheme();
  const [fallbackColor, setFallbackColor] = React.useState<string>("#808080");

  // Debug logging
  React.useEffect(() => {
    console.log(`ColorField ${label}:`, {
      value,
      fallbackColor,
      cssVariable,
      displayColor: value || fallbackColor,
    });
  }, [value, fallbackColor, cssVariable, label]);

  // Get the actual CSS variable value when value is null
  React.useEffect(() => {
    if (!value && cssVariable) {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const cssValue = computedStyle.getPropertyValue(cssVariable).trim();
      if (cssValue) {
        setFallbackColor(cssValue);
      }
    }
  }, [value, cssVariable, resolvedTheme]);

  // Determine the display color
  const displayColor = value || fallbackColor;
  const isUsingFallback = !value && cssVariable;

  return (
    <div className="space-y-3">
      {/* Header with label and description */}
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Color comparison and controls */}
      <div className="flex items-center gap-8">
        {/* Current color display */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: displayColor }}
              title={`Current: ${displayColor}`}
            />
            <span className="text-xs font-medium">Current</span>
          </div>

          <ColorPicker
            label=""
            value={displayColor}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>

        {/* Default color reference */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: fallbackColor }}
              title={`Default: ${fallbackColor}`}
            />
            <span className="text-xs text-muted-foreground">Default</span>
          </div>

          <button
            type="button"
            onClick={() => onChange(fallbackColor)}
            className="text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-3 py-2 rounded-md border border-border shadow-sm h-10"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
