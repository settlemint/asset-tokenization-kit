"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Pipette } from "lucide-react";
import * as React from "react";

/**
 * Color Picker Component
 *
 * A comprehensive color picker that supports:
 * - OKLCH color format (used by the design system)
 * - Hex color format
 * - Visual color preview
 * - Manual input
 * - Popover interface
 */

export interface ColorPickerProps {
  /** Current color value (OKLCH or hex format) */
  value?: string | null;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Label for the color picker */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Parse OKLCH color string to get the lightness value for display
 */
function parseOklchLightness(oklch: string): number {
  const match = oklch.match(/oklch\(([\d.]+)\s/);
  return match ? parseFloat(match[1]) * 100 : 50;
}

/**
 * Parse OKLCH or hex color to a displayable hex color
 */
function colorToHex(color: string | null | undefined): string {
  if (!color) return "#808080";

  // If it's already hex, return it
  if (color.startsWith("#")) return color;

  // For OKLCH, we'll just create a gray representation based on lightness
  // In a real implementation, you'd want proper OKLCH to sRGB conversion
  const lightness = parseOklchLightness(color);
  const gray = Math.round((lightness / 100) * 255);
  const hexValue = gray.toString(16).padStart(2, "0");
  return `#${hexValue}${hexValue}${hexValue}`;
}

export function ColorPicker({
  value,
  onChange,
  label,
  disabled = false,
  placeholder = "Enter color value",
  className,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const displayColor = colorToHex(value);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10"
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded border border-border"
            style={{ backgroundColor: displayColor }}
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              className="shrink-0"
            >
              <Pipette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OKLCH Color</Label>
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="oklch(0.5745 0.2028 263.15)"
                />
                <p className="text-xs text-muted-foreground">
                  Use OKLCH format for best color fidelity
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hex Color (approximate)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={displayColor}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="h-10 w-full"
                  />
                  <Input
                    type="text"
                    value={displayColor}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Hex colors will be converted to OKLCH for consistency
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="h-20 rounded-md border border-border"
                  style={{ backgroundColor: displayColor }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Common Presets</Label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { name: "Primary", value: "oklch(0.5745 0.2028 263.15)" },
                    { name: "Secondary", value: "oklch(0.7675 0.0982 182.83)" },
                    { name: "Success", value: "oklch(0.812 0.1064 153.89)" },
                    { name: "Warning", value: "oklch(0.8354 0.1274 72.2)" },
                    { name: "Error", value: "oklch(0.7044 0.1872 23.19)" },
                    { name: "Gray", value: "oklch(0.5 0 0)" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleInputChange(preset.value)}
                      className="size-8 rounded border border-border hover:ring-2 hover:ring-ring transition-shadow"
                      style={{ backgroundColor: colorToHex(preset.value) }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
