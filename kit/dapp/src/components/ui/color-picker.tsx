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
 * Parse OKLCH color string to get components
 */
function parseOklch(oklch: string): { l: number; c: number; h: number } | null {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return null;

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

/**
 * Convert OKLCH to RGB (simplified conversion)
 */
function oklchToRgb(oklch: string): { r: number; g: number; b: number } | null {
  const parsed = parseOklch(oklch);
  if (!parsed) return null;

  const { l, c: chroma, h } = parsed;

  // Simple OKLCH to RGB approximation
  // Convert OKLCH to Lab-like values first
  const lightness = l;
  const chromaValue = chroma;
  const hue = h;

  // Convert to HSL-like values for easier RGB conversion
  const hNorm = hue / 360;
  const s = Math.min(chromaValue * 0.8, 1); // Scale chroma to saturation
  const lNorm = lightness;

  // HSL to RGB conversion
  const c = (1 - Math.abs(2 * lNorm - 1)) * s;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;

  let r, g, b;
  if (hNorm < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hNorm < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hNorm < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hNorm < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hNorm < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.max(0, Math.min(255, Math.round((r + m) * 255))),
    g: Math.max(0, Math.min(255, Math.round((g + m) * 255))),
    b: Math.max(0, Math.min(255, Math.round((b + m) * 255))),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Parse OKLCH or hex color to a displayable hex color
 * For OKLCH colors, we'll use CSS to render the actual color
 */
function colorToHex(color: string | null | undefined): string {
  if (!color) return "#808080";

  // If it's already hex, return it
  if (color.startsWith("#")) return color;

  // For OKLCH, we'll create a temporary element to get the actual rendered color
  if (color.startsWith("oklch(")) {
    try {
      // Check if we're in a browser environment
      if (typeof document === "undefined") {
        return "#808080";
      }

      // Create a temporary div to get the actual rendered color
      const tempDiv = document.createElement("div");
      tempDiv.style.backgroundColor = color;
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);

      // Force a reflow to ensure the style is applied
      tempDiv.offsetHeight;

      const computedColor = getComputedStyle(tempDiv).backgroundColor;
      document.body.removeChild(tempDiv);

      // Convert rgb() to hex
      if (
        computedColor &&
        computedColor !== "rgba(0, 0, 0, 0)" &&
        computedColor !== "transparent"
      ) {
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          return rgbToHex(r, g, b);
        }
      }
    } catch (error) {
      console.warn("Failed to convert OKLCH to hex:", error);
    }
  }

  // Fallback to gray
  return "#808080";
}

export function ColorPicker({
  value,
  onChange,
  label,
  disabled = false,
  placeholder = "Select color",
  className,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [displayColor, setDisplayColor] = React.useState("#808080");

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Convert color to hex with proper React state management
  React.useEffect(() => {
    console.log("ColorPicker useEffect triggered with value:", value);

    if (!value) {
      console.log("No value, setting grey");
      setDisplayColor("#808080");
      return;
    }

    if (value.startsWith("#")) {
      console.log("Hex color detected:", value);
      setDisplayColor(value);
      return;
    }

    if (value.startsWith("oklch(")) {
      console.log("OKLCH color detected:", value);

      // Use a timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          // Create a canvas to get the actual color
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            console.log("Setting canvas fillStyle to:", value);
            ctx.fillStyle = value;
            ctx.fillRect(0, 0, 1, 1);
            const imageData = ctx.getImageData(0, 0, 1, 1);
            const [r, g, b] = imageData.data;

            console.log("Canvas conversion result:", { r, g, b });
            const hexColor = rgbToHex(r, g, b);
            console.log("Final hex color:", hexColor);
            setDisplayColor(hexColor);
          } else {
            console.warn("Canvas context not available");
            setDisplayColor("#808080");
          }
        } catch (error) {
          console.warn("Failed to convert OKLCH to hex:", error);
          setDisplayColor("#808080");
        }
      }, 0);

      return () => clearTimeout(timer);
    }

    console.log("Unknown color format, setting grey:", value);
    setDisplayColor("#808080");
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled} className="h-10 px-3">
              <span className="text-sm">Change color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center">
                <h3 className="font-semibold text-sm">Color Picker</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a color
                </p>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="relative">
                  <div
                    className="h-16 w-full rounded-md border-2 border-border shadow-sm"
                    style={{ backgroundColor: displayColor }}
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {displayColor}
                  </div>
                </div>
              </div>

              {/* Hex Color Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hex Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={displayColor}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="h-10 w-16 p-1 border-2 border-border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={displayColor}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("")}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
