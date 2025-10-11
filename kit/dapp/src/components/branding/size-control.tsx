"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

/**
 * Size Control Component
 *
 * Provides + and - buttons to adjust size values with visual feedback.
 * Used for logo size and title text size controls.
 */

interface SizeControlProps {
  label: string;
  description: string;
  value: string | null;
  onChange: (value: string | null) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultSize?: number;
}

export function SizeControl({
  label,
  description,
  value,
  onChange,
  min = 0.5,
  max = 2.0,
  step = 0.1,
  defaultSize = 1.0,
}: SizeControlProps) {
  const currentSize = value ? parseFloat(value) : defaultSize;

  const handleDecrease = () => {
    const newSize = Math.max(min, currentSize - step);
    onChange(newSize.toFixed(1));
  };

  const handleIncrease = () => {
    const newSize = Math.min(max, currentSize + step);
    onChange(newSize.toFixed(1));
  };

  const handleReset = () => {
    onChange(defaultSize.toFixed(1));
  };

  const isAtMin = currentSize <= min;
  const isAtMax = currentSize >= max;
  const isDefault = currentSize === defaultSize;

  return (
    <div className="space-y-3">
      {/* Header with label and description */}
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Size controls */}
      <div className="flex items-center gap-3">
        {/* Current size display */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-12 h-8 bg-muted rounded-md border">
            <span className="text-sm font-mono">{currentSize.toFixed(1)}x</span>
          </div>
          <span className="text-xs font-medium">Current</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={isAtMin}
            className="h-8 w-8"
          >
            <Minus className="h-3 w-3" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={isAtMax}
            className="h-8 w-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Default size reference */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-12 h-8 bg-muted rounded-md border">
            <span className="text-sm font-mono">{defaultSize.toFixed(1)}x</span>
          </div>
          <span className="text-xs text-muted-foreground">Default</span>
        </div>

        {/* Reset button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isDefault}
          className="text-xs h-8 px-3"
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
