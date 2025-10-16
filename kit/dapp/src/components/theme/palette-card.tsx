import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ThemeConfig, ThemeToken } from "@/components/theme/schema";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import type { ThemeFormApi, ThemeTranslateFn } from "./types";

type ThemeMode = keyof ThemeConfig["cssVars"];

type PaletteCardProps = {
  sectionId: string;
  form: ThemeFormApi;
  baseTheme: ThemeConfig;
  mode: ThemeMode;
  tokens: ThemeToken[];
  t: ThemeTranslateFn;
};

export function PaletteCard({
  sectionId,
  form,
  baseTheme,
  mode,
  tokens,
  t,
}: PaletteCardProps) {
  return (
    <Card id={sectionId} className="scroll-mt-28">
      <CardHeader>
        <CardTitle>
          {mode === "light"
            ? t("settings.theme.lightPaletteTitle", "Light palette")
            : t("settings.theme.darkPaletteTitle", "Dark palette")}
        </CardTitle>
        <CardDescription>
          {mode === "light"
            ? t(
                "settings.theme.lightPaletteDescription",
                "Define token values applied when the interface is in light mode."
              )
            : t(
                "settings.theme.darkPaletteDescription",
                "Define token values applied when the interface is in dark mode."
              )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 pb-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">
                    {t("settings.theme.tokenColumn", "Token")}
                  </TableHead>
                  <TableHead>
                    {t("settings.theme.valueColumn", "Value")}
                  </TableHead>
                  <TableHead className="w-24">
                    {t("settings.theme.previewColumn", "Preview")}
                  </TableHead>
                  <TableHead className="w-24 text-right">
                    {t("settings.theme.actionsColumn", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <PaletteTokenRow
                    key={`${mode}-${token}`}
                    form={form}
                    baseTheme={baseTheme}
                    mode={mode}
                    token={token}
                    t={t}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type PaletteTokenRowProps = {
  form: ThemeFormApi;
  baseTheme: ThemeConfig;
  mode: ThemeMode;
  token: ThemeToken;
  t: ThemeTranslateFn;
};

function PaletteTokenRow({
  form,
  baseTheme,
  mode,
  token,
  t,
}: PaletteTokenRowProps) {
  return (
    <form.Field name={`cssVars.${mode}.${token}` as const}>
      {(field) => {
        const defaultValue = baseTheme.cssVars[mode][token];
        const currentValue =
          typeof field.state.value === "string" ? field.state.value : "";
        const errorMessage = field.state.meta.errors?.[0];
        return (
          <TableRow>
            <TableCell className="font-mono text-xs">{token}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Input
                  value={currentValue}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder={defaultValue}
                />
              </div>
              {errorMessage ? (
                <p className="pt-1 text-[11px] text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </TableCell>
            <TableCell className="w-24">
              <ColorEditorPopover
                token={token}
                value={currentValue}
                defaultValue={defaultValue}
                onChange={field.handleChange}
                t={t}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  field.handleChange(defaultValue);
                }}
              >
                {t("settings.theme.revertButton", "Revert")}
              </Button>
            </TableCell>
          </TableRow>
        );
      }}
    </form.Field>
  );
}

type ColorEditorPopoverProps = {
  token: ThemeToken;
  value: string;
  defaultValue: string;
  onChange: (nextValue: string) => void;
  t: ThemeTranslateFn;
};

function ColorEditorPopover({
  token,
  value,
  defaultValue,
  onChange,
  t,
}: ColorEditorPopoverProps) {
  const [open, setOpen] = useState(false);
  const colorString = value.trim().length > 0 ? value : defaultValue;
  const parsed = useMemo(() => parseColorValue(colorString), [colorString]);
  const rgba = parsed?.rgba ?? null;
  const oklchValue = parsed?.oklch ?? (rgba ? rgbToOklch(rgba) : null);
  const hslValue = parsed?.hsl ?? (rgba ? rgbToHsl(rgba) : null);
  const hexValue = rgba === null ? "#000000" : rgbaToHex(rgba);

  const handleColorInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const hex = event.target.value;
    const nextRgba = hexToRgba(hex, rgba?.alpha ?? 1);
    if (!nextRgba) {
      return;
    }
    if (parsed?.model === "hsl" && hslValue) {
      onChange(formatHsl(rgbToHsl({ ...nextRgba, alpha: hslValue.alpha })));
      return;
    }
    onChange(formatOklch(rgbToOklch(nextRgba)));
  };

  const handleOklchChange = (key: keyof OklchColor, nextValue: number) => {
    if (Number.isNaN(nextValue)) {
      return;
    }
    if (!oklchValue) {
      return;
    }
    const next = {
      ...oklchValue,
      [key]:
        key === "alpha"
          ? clamp(nextValue, 0, 1)
          : key === "h"
            ? normalizeHue(nextValue)
            : nextValue,
    };
    onChange(formatOklch(next));
  };

  const handleHslChange = (key: keyof HslColor, nextValue: number) => {
    if (Number.isNaN(nextValue)) {
      return;
    }
    if (!hslValue) {
      return;
    }
    const next = {
      ...hslValue,
      [key]:
        key === "alpha"
          ? clamp(nextValue, 0, 1)
          : key === "h"
            ? normalizeHue(nextValue)
            : clamp(nextValue, 0, 100),
    };
    onChange(formatHsl(next));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("settings.theme.editColor", "Edit {{token}} color", {
            token,
          })}
          className="flex size-8 items-center justify-center rounded border shadow-sm transition hover:ring-2 hover:ring-ring hover:ring-offset-1"
          style={{
            background: colorString || defaultValue,
            borderColor: defaultValue,
          }}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("settings.theme.colorEditorTitle", "Color editor")}
          </p>
          <input
            type="color"
            value={hexValue}
            onChange={handleColorInputChange}
            className="h-10 w-full cursor-pointer rounded border bg-transparent"
            aria-label={t("settings.theme.colorInputLabel", "Select color")}
          />
          <p className="text-[11px] text-muted-foreground truncate font-mono">
            {colorString}
          </p>
        </div>
        {oklchValue ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              OKLCH
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={formatDecimal(oklchValue.l)}
                onChange={(event) => {
                  handleOklchChange("l", Number.parseFloat(event.target.value));
                }}
                aria-label={t(
                  "settings.theme.oklchLightness",
                  "OKLCH lightness"
                )}
              />
              <Input
                type="number"
                step="0.001"
                min="0"
                value={formatDecimal(oklchValue.c)}
                onChange={(event) => {
                  handleOklchChange("c", Number.parseFloat(event.target.value));
                }}
                aria-label={t("settings.theme.oklchChroma", "OKLCH chroma")}
              />
              <Input
                type="number"
                step="0.1"
                value={formatDecimal(oklchValue.h, 2)}
                onChange={(event) => {
                  handleOklchChange("h", Number.parseFloat(event.target.value));
                }}
                aria-label={t("settings.theme.oklchHue", "OKLCH hue")}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatDecimal(oklchValue.alpha, 2)}
                onChange={(event) => {
                  handleOklchChange(
                    "alpha",
                    Number.parseFloat(event.target.value)
                  );
                }}
                aria-label={t("settings.theme.oklchAlpha", "OKLCH alpha")}
              />
            </div>
          </div>
        ) : null}
        {hslValue ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              HSL
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.1"
                value={formatDecimal(hslValue.h, 2)}
                onChange={(event) => {
                  handleHslChange("h", Number.parseFloat(event.target.value));
                }}
                aria-label={t("settings.theme.hslHue", "HSL hue")}
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formatDecimal(hslValue.s, 2)}
                onChange={(event) => {
                  handleHslChange("s", Number.parseFloat(event.target.value));
                }}
                aria-label={t("settings.theme.hslSaturation", "HSL saturation")}
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formatDecimal(hslValue.l, 2)}
                onChange={(event) => {
                  handleHslChange("l", Number.parseFloat(event.target.value));
                }}
                aria-label={t("settings.theme.hslLightness", "HSL lightness")}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatDecimal(hslValue.alpha, 2)}
                onChange={(event) => {
                  handleHslChange(
                    "alpha",
                    Number.parseFloat(event.target.value)
                  );
                }}
                aria-label={t("settings.theme.hslAlpha", "HSL alpha")}
              />
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

type RgbaColor = {
  r: number;
  g: number;
  b: number;
  alpha: number;
};

type OklchColor = {
  l: number;
  c: number;
  h: number;
  alpha: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
  alpha: number;
};

type ParsedColor = {
  rgba: RgbaColor | null;
  oklch: OklchColor | null;
  hsl: HslColor | null;
  model: "oklch" | "hsl" | "hex" | "unknown";
};

function parseColorValue(raw: string): ParsedColor {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { rgba: null, oklch: null, hsl: null, model: "unknown" };
  }
  if (trimmed.startsWith("oklch(")) {
    const parsed = parseOklch(trimmed);
    if (parsed) {
      return {
        rgba: oklchToRgba(parsed),
        oklch: parsed,
        hsl: rgbToHsl(oklchToRgba(parsed)),
        model: "oklch",
      };
    }
  }
  if (trimmed.startsWith("hsl(")) {
    const parsed = parseHsl(trimmed);
    if (parsed) {
      return {
        rgba: hslToRgba(parsed),
        oklch: rgbToOklch(hslToRgba(parsed)),
        hsl: parsed,
        model: "hsl",
      };
    }
  }
  if (trimmed.startsWith("#")) {
    const rgba = hexToRgba(trimmed, 1);
    if (rgba) {
      return {
        rgba,
        oklch: rgbToOklch(rgba),
        hsl: rgbToHsl(rgba),
        model: "hex",
      };
    }
  }
  const rgba = hexToRgba(trimmed, 1);
  if (rgba) {
    return {
      rgba,
      oklch: rgbToOklch(rgba),
      hsl: rgbToHsl(rgba),
      model: "hex",
    };
  }
  return { rgba: null, oklch: null, hsl: null, model: "unknown" };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeHue(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function formatDecimal(value: number, precision = 3): string {
  return Number.isFinite(value) ? value.toFixed(precision) : "0";
}

function parseOklch(input: string): OklchColor | null {
  const match =
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i.exec(
      input
    );
  if (!match) {
    return null;
  }
  const [, lString, cString, hString, alphaString] = match;
  const lSource = lString ?? "";
  const cSource = cString ?? "";
  const hSource = hString ?? "";
  const alphaSource = alphaString ?? "";
  const l = clamp(Number.parseFloat(lSource), 0, 1);
  const c = Math.max(Number.parseFloat(cSource), 0);
  const h = normalizeHue(Number.parseFloat(hSource));
  const alpha =
    alphaString === undefined ? 1 : clamp(Number.parseFloat(alphaSource), 0, 1);
  if ([l, c, h, alpha].some((value) => Number.isNaN(value))) {
    return null;
  }
  return { l, c, h, alpha };
}

function formatOklch(color: OklchColor): string {
  const parts = [
    clamp(color.l, 0, 1).toFixed(3),
    Math.max(color.c, 0).toFixed(4),
    normalizeHue(color.h).toFixed(2),
  ];
  const alpha = clamp(color.alpha, 0, 1);
  if (alpha < 1) {
    parts.push(`/ ${alpha.toFixed(2)}`);
  }
  return `oklch(${parts.join(" ")})`;
}

function parseHsl(input: string): HslColor | null {
  const match =
    /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*\/\s*([\d.]+))?\s*\)$/i.exec(
      input
    );
  if (!match) {
    return null;
  }
  const [, hString, sString, lString, alphaString] = match;
  const hSource = hString ?? "";
  const sSource = sString ?? "";
  const lSource = lString ?? "";
  const alphaSource = alphaString ?? "";
  const h = normalizeHue(Number.parseFloat(hSource));
  const s = clamp(Number.parseFloat(sSource), 0, 100);
  const l = clamp(Number.parseFloat(lSource), 0, 100);
  const alpha =
    alphaString === undefined ? 1 : clamp(Number.parseFloat(alphaSource), 0, 1);
  if ([h, s, l, alpha].some((value) => Number.isNaN(value))) {
    return null;
  }
  return { h, s, l, alpha };
}

function formatHsl(color: HslColor): string {
  const { h, s, l, alpha } = color;
  const parts = [
    normalizeHue(h).toFixed(2),
    `${clamp(s, 0, 100).toFixed(2)}%`,
    `${clamp(l, 0, 100).toFixed(2)}%`,
  ];
  const alphaClamped = clamp(alpha, 0, 1);
  if (alphaClamped < 1) {
    parts.push(`/ ${alphaClamped.toFixed(2)}`);
  }
  return `hsl(${parts.join(", ")})`;
}

function oklchToRgba(color: OklchColor): RgbaColor {
  const l = clamp(color.l, 0, 1);
  const c = Math.max(color.c, 0);
  const hRadians = (normalizeHue(color.h) * Math.PI) / 180;
  const a = c * Math.cos(hRadians);
  const b = c * Math.sin(hRadians);

  const y = l + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
  const x = l + 0.312_869_995_1 * a - 0.639_524_943_6 * b;
  const z = l - 0.162_377_888_7 * a + 0.409_517_361_3 * b;

  const rLinear =
    4.076_741_662_1 * x - 3.307_711_591_3 * y + 0.230_969_929_2 * z;
  const gLinear =
    -1.268_438_004_6 * x + 2.609_757_401_1 * y - 0.341_319_396_5 * z;
  const bLinear =
    -0.004_196_086_3 * x - 0.703_418_614_7 * y + 1.707_614_701 * z;

  return {
    r: clamp(linearToSrgb(rLinear), 0, 1),
    g: clamp(linearToSrgb(gLinear), 0, 1),
    b: clamp(linearToSrgb(bLinear), 0, 1),
    alpha: clamp(color.alpha, 0, 1),
  };
}

function rgbToOklch(color: RgbaColor): OklchColor {
  const rLinear = srgbToLinear(color.r);
  const gLinear = srgbToLinear(color.g);
  const bLinear = srgbToLinear(color.b);

  const x =
    0.412_221_470_8 * rLinear +
    0.536_332_536_3 * gLinear +
    0.051_445_992_9 * bLinear;
  const y =
    0.211_903_498_2 * rLinear +
    0.680_699_545_1 * gLinear +
    0.107_396_956_6 * bLinear;
  const z =
    0.088_302_461_9 * rLinear +
    0.281_718_837_6 * gLinear +
    0.629_978_700_5 * bLinear;

  const l = 0.210_454_255_3 * x + 0.793_617_785 * y - 0.004_072_046_8 * z;
  const m = 1.977_998_495_1 * x - 2.428_592_205 * y + 0.450_593_709_9 * z;
  const s = 0.025_904_037_1 * x + 0.782_771_766_2 * y - 0.808_675_766 * z;

  const lPrime = Math.cbrt(l);
  const mPrime = Math.cbrt(m);
  const sPrime = Math.cbrt(s);

  const lTilde =
    0.210_454_255_3 * lPrime +
    0.793_617_785 * mPrime -
    0.004_072_046_8 * sPrime;
  const a =
    1.977_998_495_1 * lPrime -
    2.428_592_205 * mPrime +
    0.450_593_709_9 * sPrime;
  const b =
    0.025_904_037_1 * lPrime +
    0.782_771_766_2 * mPrime -
    0.808_675_766 * sPrime;

  const c = Math.hypot(a, b);
  const hRadians = Math.atan2(b, a);

  return {
    l: clamp(lTilde, 0, 1),
    c,
    h: normalizeHue((hRadians * 180) / Math.PI),
    alpha: clamp(color.alpha, 0, 1),
  };
}

function rgbToHsl(color: RgbaColor): HslColor {
  const r = clamp(color.r, 0, 1);
  const g = clamp(color.g, 0, 1);
  const b = clamp(color.b, 0, 1);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: normalizeHue(h),
    s: clamp(s * 100, 0, 100),
    l: clamp(l * 100, 0, 100),
    alpha: clamp(color.alpha, 0, 1),
  };
}

function hslToRgba(color: HslColor): RgbaColor {
  const h = normalizeHue(color.h) / 360;
  const s = clamp(color.s, 0, 100) / 100;
  const l = clamp(color.l, 0, 100) / 100;
  const alpha = clamp(color.alpha, 0, 1);

  if (s === 0) {
    return { r: l, g: l, b: l, alpha };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: hueToRgb(p, q, h + 1 / 3),
    g: hueToRgb(p, q, h),
    b: hueToRgb(p, q, h - 1 / 3),
    alpha,
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function rgbaToHex(color: RgbaColor): string {
  const r = Math.round(clamp(color.r, 0, 1) * 255);
  const g = Math.round(clamp(color.g, 0, 1) * 255);
  const b = Math.round(clamp(color.b, 0, 1) * 255);
  const a = Math.round(clamp(color.alpha, 0, 1) * 255);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}${componentToHex(a)}`;
}

function componentToHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function hexToRgba(hex: string, alphaFallback: number): RgbaColor | null {
  const normalized = hex.replace("#", "").trim();
  if (![3, 4, 6, 8].includes(normalized.length)) {
    return null;
  }
  const expanded =
    normalized.length === 3 || normalized.length === 4
      ? normalized.replaceAll(/./gu, (char) => char.repeat(2))
      : normalized;
  const value = expanded.padEnd(8, "f");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  const alpha =
    value.length >= 8
      ? Number.parseInt(value.slice(6, 8), 16) / 255
      : alphaFallback;
  return { r: r / 255, g: g / 255, b: b / 255, alpha };
}

function linearToSrgb(value: number): number {
  const clamped = clamp(value, 0, 1);
  if (clamped <= 0.003_130_8) {
    return clamped * 12.92;
  }
  return 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function srgbToLinear(value: number): number {
  const clamped = clamp(value, 0, 1);
  if (clamped <= 0.040_45) {
    return clamped / 12.92;
  }
  return Math.pow((clamped + 0.055) / 1.055, 2.4);
}
