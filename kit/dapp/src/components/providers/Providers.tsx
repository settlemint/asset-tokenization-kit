import { AuthProvider } from "@/components/blocks/auth/auth-provider";
import { ThemeProvider } from "@/components/blocks/theme/theme-provider";
import { TransitionProvider } from "@/components/layout/transition-provider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { getServerEnvironment } from "@/lib/config/environment";
import { NextIntlClientProvider } from "next-intl";

/**
 * Extracts authentication configuration from environment variables.
 * 
 * This function determines which authentication methods are enabled based on
 * the presence of required environment variables. It provides a centralized
 * way to configure authentication providers, making it easier to test and
 * maintain the authentication setup.
 * 
 * @param env - The server environment configuration
 * @returns Object containing flags for each enabled authentication method
 */
const getAuthConfig = (env: ReturnType<typeof getServerEnvironment>) => ({
  emailEnabled: !!env.RESEND_API_KEY,
  googleEnabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  githubEnabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
});

export function Providers({ children }: { children: React.ReactNode }) {
  const env = getServerEnvironment();
  const authConfig = getAuthConfig(env);

  return (
    <PostHogProvider>
      <QueryClientProvider>
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" enableColorScheme enableSystem>
            <TransitionProvider>
              <AuthProvider {...authConfig}>
                {children}
              </AuthProvider>
            </TransitionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
