import { EmailTemplate } from "@/components/blocks/email/email-template";
import { getServerEnvironment } from "@/lib/config/environment";
import { siteConfig } from "@/lib/config/site";
import type { betterAuth } from "better-auth";
import { Resend } from "resend";

const env = getServerEnvironment();

const hasEmailConfigured = env.RESEND_API_KEY !== undefined;
const resend = hasEmailConfigured ? new Resend(env.RESEND_API_KEY) : undefined;

export const emailVerification: Parameters<
  typeof betterAuth
>[0]["emailVerification"] = hasEmailConfigured
  ? {
      sendVerificationEmail: async ({ user, url }) => {
        if (!hasEmailConfigured || !resend) {
          throw new Error("Email is not configured");
        }
        const name =
          (user.name || user.email.split("@")[0]).charAt(0).toUpperCase() +
          (user.name || user.email.split("@")[0]).slice(1);

        await resend.emails.send({
          from: `${siteConfig.publisher} ${siteConfig.name} <${siteConfig.email}>`,
          to: user.email,
          subject: "Verify your email address",
          react: EmailTemplate({
            action: "Verify Email",
            content: (
              <>
                <p>{`Hello ${name},`}</p>

                <p>Click the button below to verify your email address.</p>
              </>
            ),
            heading: "Verify Email",
            url,
          }),
        });
      },
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
    }
  : undefined;

export const sendDeleteAccountVerification: NonNullable<
  NonNullable<Parameters<typeof betterAuth>[0]["user"]>["deleteUser"]
>["sendDeleteAccountVerification"] = hasEmailConfigured
  ? async ({ user, url }: { user: { email: string }; url: string }) => {
      if (!hasEmailConfigured || !resend) {
        throw new Error("Email is not configured");
      }

      await resend.emails.send({
        from: `${siteConfig.publisher} ${siteConfig.name} <${siteConfig.email}>`,
        to: user.email,
        subject: `Sign in to ${siteConfig.name}`,
        react: EmailTemplate({
          action: "Sign in to SettleMint",
          content: (
            <>
              <p>Hello,</p>

              <p>Click the button below to sign in to your account.</p>
            </>
          ),
          heading: `Sign in to ${siteConfig.name}`,
          url,
        }),
      });
    }
  : undefined;

export const sendMagicLink = async ({
  email,
  url,
}: {
  email: string;
  url: string;
  token: string;
}) => {
  if (!hasEmailConfigured || !resend) {
    throw new Error("Email is not configured");
  }

  await resend.emails.send({
    from: `${siteConfig.publisher} ${siteConfig.name} <${siteConfig.email}>`,
    to: email,
    subject: `Sign in to ${siteConfig.name}`,
    react: EmailTemplate({
      action: "Sign in to SettleMint",
      content: (
        <>
          <p>Hello,</p>

          <p>Click the button below to sign in to your account.</p>
        </>
      ),
      heading: `Sign in to ${siteConfig.name}`,
      url,
    }),
  });
};
