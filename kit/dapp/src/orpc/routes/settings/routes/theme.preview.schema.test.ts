import { describe, expect, it } from "vitest";
import { ThemePreviewSchema } from "./theme.preview.schema";
import { DEFAULT_THEME } from "@/components/theme/lib/schema";

describe("ThemePreviewSchema", () => {
  it("accepts a partial diff with base version", () => {
    const result = ThemePreviewSchema.safeParse({
      diff: {
        cssVars: {
          light: {
            "sm-background-lightest":
              DEFAULT_THEME.cssVars.light["sm-background-lightest"],
          },
        },
      },
      ttlSeconds: 30,
      baseVersion: DEFAULT_THEME.metadata.version,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing base version", () => {
    const result = ThemePreviewSchema.safeParse({
      diff: {},
      ttlSeconds: 30,
    });

    expect(result.success).toBe(false);
  });
});
