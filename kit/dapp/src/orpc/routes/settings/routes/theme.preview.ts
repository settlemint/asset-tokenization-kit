import { setThemePreview } from "@/components/theme/preview-store";
import { getTheme, mergeTheme } from "@/components/theme/repository";
import type { ThemeConfigPartial } from "@/components/theme/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

export const preview = authRouter.settings.theme.preview
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["upsert"] },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const diff: ThemeConfigPartial = input.diff ?? {};
    const baseTheme = await getTheme();

    if (input.baseVersion !== baseTheme.metadata.version) {
      errors.CONFLICT({
        message:
          "Theme has changed since you last fetched it. Refresh before previewing.",
        data: {
          expectedVersion: baseTheme.metadata.version,
          receivedVersion: input.baseVersion,
        },
      });
    }
    const merged = mergeTheme(baseTheme, diff);
    const theme = {
      ...merged,
      metadata: {
        ...merged.metadata,
        updatedBy: context.auth.user.id,
        updatedAt: new Date().toISOString(),
      },
    };
    const expiresAt = setThemePreview(
      context.auth.user.id,
      theme,
      input.ttlSeconds
    );
    return {
      theme,
      expiresAt,
    };
  });
