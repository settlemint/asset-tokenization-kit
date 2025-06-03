import { AuthProvider } from "@/components/blocks/auth/auth-provider";
import { ThemeProvider } from "@/components/blocks/theme/theme-provider";
import { TransitionProvider } from "@/components/layout/transition-provider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { getServerEnvironment } from "@/lib/config/environment";
import { NextIntlClientProvider } from "next-intl";

const timeZone = "Europe/Brussels";

export function Providers({ children }: { children: React.ReactNode }) {
  const env = getServerEnvironment();

  return (
    <PostHogProvider>
      <QueryClientProvider>
        <NextIntlClientProvider timeZone={timeZone}>
          <ThemeProvider attribute="class" enableColorScheme enableSystem>
            <TransitionProvider>
              <AuthProvider
                emailEnabled={!!env.RESEND_API_KEY}
                googleEnabled={
                  !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
                }
                githubEnabled={
                  !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
                }
              >
                {children}
              </AuthProvider>
            </TransitionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
