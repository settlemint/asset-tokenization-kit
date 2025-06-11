"use client";

import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { useTranslations } from "next-intl";
// eslint-disable-next-line no-restricted-imports
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";

interface AuthProviderProps extends PropsWithChildren {
  emailEnabled: boolean;
  googleEnabled: boolean;
  githubEnabled: boolean;
  /**
   * The roles that are allowed to access the content
   */
  requiredRoles?: ("admin" | "issuer" | "user")[];
}

export const AuthProvider = ({
  children,
  emailEnabled,
  googleEnabled,
  githubEnabled,
}: AuthProviderProps) => {
  const router = useRouter();
  const t = useTranslations("private.auth");

  const providers: ("google" | "github")[] = [];
  if (googleEnabled) {
    providers.push("google");
  }
  if (githubEnabled) {
    providers.push("github");
  }

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        persistClient={false}
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => router.refresh()}
        Link={Link}
        settings={{
          url: "/portfolio/settings",
        }}
        credentials={{
          confirmPassword: true,
          rememberMe: true,
          forgotPassword: true,
        }}
        deleteUser={{
          verification: emailEnabled,
        }}
        avatar={false}
        magicLink={emailEnabled}
        passkey={true}
        social={
          providers.length > 0
            ? {
                providers: providers,
              }
            : undefined
        }
        toast={({ variant, message }) => {
          if (variant === "success") {
            toast.success(message);
          } else if (variant === "error") {
            toast.error(message);
          } else if (variant === "warning") {
            toast.warning(message);
          } else {
            toast.info(message);
          }
        }}
        localization={
          {
            // Map our existing translations to better-auth-ui v2's uppercase keys
            ACCOUNT: t("account"),
            ACCOUNTS: t("accounts"),
            ACCOUNTS_DESCRIPTION: t("accounts-description"),
            ACCOUNTS_INSTRUCTIONS: t("accounts-instructions"),
            ADD_ACCOUNT: t("add-account"),
            ADD_PASSKEY: t("add-passkey"),
            ALREADY_HAVE_AN_ACCOUNT: t("already-have-account"),
            AVATAR: t("avatar"),
            AVATAR_DESCRIPTION: t("avatar-description"),
            AVATAR_INSTRUCTIONS: t("avatar-instructions"),
            BACKUP_CODE_REQUIRED: t("backup-code-required"),
            BACKUP_CODES: t("backup-codes"),
            BACKUP_CODES_DESCRIPTION: t("backup-codes-description"),
            BACKUP_CODE_PLACEHOLDER: t("backup-code-placeholder"),
            BACKUP_CODE: t("backup-code"),
            CANCEL: t("cancel"),
            CHANGE_PASSWORD: t("change-password"),
            CHANGE_PASSWORD_DESCRIPTION: t("change-password-description"),
            CHANGE_PASSWORD_INSTRUCTIONS: t("change-password-instructions"),
            CHANGE_PASSWORD_SUCCESS: t("change-password-success"),
            CONFIRM_PASSWORD: t("confirm-password"),
            CONFIRM_PASSWORD_PLACEHOLDER: t("confirm-password-placeholder"),
            CONFIRM_PASSWORD_REQUIRED: t("confirm-password-required"),
            CONTINUE_WITH_AUTHENTICATOR: t("continue-with-authenticator"),
            COPIED_TO_CLIPBOARD: t("copied-to-clipboard"),
            COPY_TO_CLIPBOARD: t("copy-to-clipboard"),
            COPY_ALL_CODES: t("copy-all-codes"),
            CONTINUE: t("continue"),
            CURRENT_PASSWORD: t("current-password"),
            CURRENT_PASSWORD_PLACEHOLDER: t("current-password-placeholder"),
            CURRENT_SESSION: t("current-session"),
            DELETE: t("delete"),
            DELETE_AVATAR: t("delete-avatar"),
            DELETE_ACCOUNT: t("delete-account"),
            DELETE_ACCOUNT_DESCRIPTION: t("delete-account-description"),
            DELETE_ACCOUNT_INSTRUCTIONS: t("delete-account-instructions"),
            DELETE_ACCOUNT_VERIFY: t("delete-account-verify"),
            DELETE_ACCOUNT_SUCCESS: t("delete-account-success"),
            DONT_HAVE_AN_ACCOUNT: t("dont-have-account"),
            DONE: t("done"),
            EMAIL: t("email"),
            EMAIL_DESCRIPTION: t("email-description"),
            EMAIL_INSTRUCTIONS: t("email-instructions"),
            EMAIL_INVALID: t("email-invalid"),
            EMAIL_IS_THE_SAME: t("email-is-the-same"),
            EMAIL_PLACEHOLDER: t("email-placeholder"),
            EMAIL_REQUIRED: t("email-required"),
            EMAIL_VERIFY_CHANGE: t("email-verify-change"),
            EMAIL_VERIFICATION: t("email-verification"),
            ENABLE: t("enable"),
            ERROR: t("error"),
            IS_INVALID: t("is-invalid"),
            IS_REQUIRED: t("is-required"),
            IS_THE_SAME: t("is-the-same"),
            FORGOT_AUTHENTICATOR: t("forgot-authenticator"),
            FORGOT_PASSWORD: t("forgot-password"),
            FORGOT_PASSWORD_ACTION: t("forgot-password-action"),
            FORGOT_PASSWORD_DESCRIPTION: t("forgot-password-description"),
            FORGOT_PASSWORD_EMAIL: t("forgot-password-email"),
            FORGOT_PASSWORD_LINK: t("forgot-password-link"),
            INVALID_TWO_FACTOR_COOKIE: t("invalid-two-factor-cookie"),
            LINK: t("link"),
            MAGIC_LINK: t("magic-link"),
            MAGIC_LINK_ACTION: t("magic-link-action"),
            MAGIC_LINK_DESCRIPTION: t("magic-link-description"),
            MAGIC_LINK_EMAIL: t("magic-link-email"),
            EMAIL_OTP: t("email-otp"),
            EMAIL_OTP_SEND_ACTION: t("email-otp-send-action"),
            EMAIL_OTP_VERIFY_ACTION: t("email-otp-verify-action"),
            EMAIL_OTP_DESCRIPTION: t("email-otp-description"),
            EMAIL_OTP_VERIFICATION_SENT: t("email-otp-verification-sent"),
            NAME: t("name"),
            NAME_DESCRIPTION: t("name-description"),
            NAME_INSTRUCTIONS: t("name-instructions"),
            NAME_PLACEHOLDER: t("name-placeholder"),
            NEW_PASSWORD: t("new-password"),
            NEW_PASSWORD_PLACEHOLDER: t("new-password-placeholder"),
            NEW_PASSWORD_REQUIRED: t("new-password-required"),
            ONE_TIME_PASSWORD: t("one-time-password"),
            OR_CONTINUE_WITH: t("or-continue-with"),
            PASSKEY: t("passkey"),
            PASSKEYS: t("passkeys"),
            PASSKEYS_DESCRIPTION: t("passkeys-description"),
            PASSKEYS_INSTRUCTIONS: t("passkeys-instructions"),
            API_KEYS: t("api-keys"),
            API_KEYS_DESCRIPTION: t("api-keys-description"),
            API_KEYS_INSTRUCTIONS: t("api-keys-instructions"),
            CREATE_API_KEY: t("create-api-key"),
            CREATE_API_KEY_DESCRIPTION: t("create-api-key-description"),
            API_KEY_NAME_PLACEHOLDER: t("api-key-name-placeholder"),
            API_KEY_CREATED: t("api-key-created"),
            API_KEY_CREATED_DESCRIPTION: t("api-key-created-description"),
            NEVER_EXPIRES: t("never-expires"),
            EXPIRES: t("expires"),
            NO_EXPIRATION: t("no-expiration"),
            CREATE: t("create"),
            PASSWORD: t("password"),
            PASSWORD_PLACEHOLDER: t("password-placeholder"),
            PASSWORD_REQUIRED: t("password-required"),
            PASSWORDS_DO_NOT_MATCH: t("passwords-do-not-match"),
            PROVIDERS: t("providers"),
            PROVIDERS_DESCRIPTION: t("providers-description"),
            RECOVER_ACCOUNT: t("recover-account"),
            RECOVER_ACCOUNT_ACTION: t("recover-account-action"),
            RECOVER_ACCOUNT_DESCRIPTION: t("recover-account-description"),
            REMEMBER_ME: t("remember-me"),
            RESEND_CODE: t("resend-code"),
            RESEND_VERIFICATION_EMAIL: t("resend-verification-email"),
            RESET_PASSWORD: t("reset-password"),
            RESET_PASSWORD_ACTION: t("reset-password-action"),
            RESET_PASSWORD_DESCRIPTION: t("reset-password-description"),
            RESET_PASSWORD_INVALID_TOKEN: t("reset-password-invalid-token"),
            RESET_PASSWORD_SUCCESS: t("reset-password-success"),
            REQUEST_FAILED: t("request-failed"),
            REVOKE: t("revoke"),
            DELETE_API_KEY: t("delete-api-key"),
            DELETE_API_KEY_CONFIRMATION: t("delete-api-key-confirmation"),
            API_KEY: t("api-key"),
            SIGN_IN: t("sign-in"),
            SIGN_IN_ACTION: t("sign-in-action"),
            SIGN_IN_DESCRIPTION: t("sign-in-description"),
            SIGN_IN_USERNAME_DESCRIPTION: t("sign-in-username-description"),
            SIGN_IN_WITH: t("sign-in-with"),
            SIGN_OUT: t("sign-out"),
            SIGN_UP: t("sign-up"),
            SIGN_UP_ACTION: t("sign-up-action"),
            SIGN_UP_DESCRIPTION: t("sign-up-description"),
            SIGN_UP_EMAIL: t("sign-up-email"),
            SESSIONS: t("sessions"),
            SESSIONS_DESCRIPTION: t("sessions-description"),
            SET_PASSWORD: t("set-password"),
            SET_PASSWORD_DESCRIPTION: t("set-password-description"),
            SETTINGS: t("settings"),
            SAVE: t("save"),
            SECURITY: t("security"),
            SWITCH_ACCOUNT: t("switch-account"),
            TRUST_DEVICE: t("trust-device"),
            TWO_FACTOR: t("two-factor"),
            TWO_FACTOR_ACTION: t("two-factor-action"),
            TWO_FACTOR_DESCRIPTION: t("two-factor-description"),
            TWO_FACTOR_CARD_DESCRIPTION: t("two-factor-card-description"),
            TWO_FACTOR_DISABLE_INSTRUCTIONS: t(
              "two-factor-disable-instructions"
            ),
            TWO_FACTOR_ENABLE_INSTRUCTIONS: t("two-factor-enable-instructions"),
            TWO_FACTOR_ENABLED: t("two-factor-enabled"),
            TWO_FACTOR_DISABLED: t("two-factor-disabled"),
            TWO_FACTOR_PROMPT: t("two-factor-prompt"),
            TWO_FACTOR_TOTP_LABEL: t("two-factor-totp-label"),
            SEND_VERIFICATION_CODE: t("send-verification-code"),
            UNLINK: t("unlink"),
            UPDATED_SUCCESSFULLY: t("updated-successfully"),
            USERNAME: t("username"),
            USERNAME_DESCRIPTION: t("username-description"),
            USERNAME_INSTRUCTIONS: t("username-instructions"),
            USERNAME_PLACEHOLDER: t("username-placeholder"),
            SIGN_IN_USERNAME_PLACEHOLDER: t("sign-in-username-placeholder"),
            VERIFY_YOUR_EMAIL: t("verify-your-email"),
            VERIFY_YOUR_EMAIL_DESCRIPTION: t("verify-your-email-description"),
            GO_BACK: t("go-back"),
            INVALID_EMAIL_OR_PASSWORD: t("invalid-email-or-password"),
            PASSWORD_INVALID: t("password-invalid"),
            SESSION_NOT_FRESH: t("session-not-fresh"),
            SESSION_EXPIRED: t("session-expired"),
            PASSWORD_TOO_SHORT: t("password-too-short"),
            PASSWORD_TOO_LONG: t("password-too-long"),
            UPLOAD_AVATAR: t("upload-avatar"),
            PRIVACY_POLICY: t("privacy-policy"),
            TERMS_OF_SERVICE: t("terms-of-service"),
            PROTECTED_BY_RECAPTCHA: t("protected-by-recaptcha"),
            BY_CONTINUING_YOU_AGREE: t("by-continuing-you-agree"),
            MISSING_CAPTCHA_RESPONSE: t("missing-captcha-response"),
          } as any
        }
      >
        <div className="AuthProvider">{children}</div>
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
};
