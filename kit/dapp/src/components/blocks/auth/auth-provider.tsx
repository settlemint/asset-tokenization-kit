"use client";

import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import type { AuthUIProviderProps } from "@daveyplate/better-auth-ui";
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

  const providers: AuthUIProviderProps["social"]["providers"] = [];
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
          url: "/portfolio/settings/profile",
        }}
        redirectTo="/portfolio"
        credentials={{
          confirmPassword: true,
          rememberMe: true,
          forgotPassword: emailEnabled,
        }}
        optimistic={true}
        deleteUser={{
          verification: emailEnabled ? "email" : undefined,
        }}
        avatar={false}
        magicLink={emailEnabled}
        passkey={true}
        social={{
          providers: providers.length > 0 ? providers : undefined,
        }}
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
        localization={{
          /** @default "Account" */
          ACCOUNT: t("account"),
          /** @default "Accounts" */
          ACCOUNTS: t("accounts"),
          /** @default "Manage your currently signed in accounts." */
          ACCOUNTS_DESCRIPTION: t("accounts-description"),
          /** @default "Sign in to an additional account." */
          ACCOUNTS_INSTRUCTIONS: t("accounts-instructions"),
          /** @default "Add Account" */
          ADD_ACCOUNT: t("add-account"),
          /** @default "Add Passkey" */
          ADD_PASSKEY: t("add-passkey"),
          /** @default "Already have an account?" */
          ALREADY_HAVE_AN_ACCOUNT: t("already-have-account"),
          /** @default "Avatar" */
          AVATAR: t("avatar"),
          /** @default "Click on the avatar to upload a custom one from your files." */
          AVATAR_DESCRIPTION: t("avatar-description"),
          /** @default "An avatar is optional but strongly recommended." */
          AVATAR_INSTRUCTIONS: t("avatar-instructions"),
          /** @default "Backup code is required" */
          BACKUP_CODE_REQUIRED: t("backup-code-required"),
          /** @default "Backup Codes" */
          BACKUP_CODES: t("backup-codes"),
          /** @default "Save these backup codes in a secure place. You can use them to access your account if you lose your two-factor authentication method." */
          BACKUP_CODES_DESCRIPTION: t("backup-codes-description"),
          /** @default "Enter one of your backup codes. Once used, each code can only be used once and will be invalidated after use." */
          BACKUP_CODE_PLACEHOLDER: t("backup-code-placeholder"),
          /** @default "Backup Code" */
          BACKUP_CODE: t("backup-code"),
          /** @default "Recover account" */
          BACKUP_CODE_ACTION: t("backup-code-action"),
          /** @default "Cancel" */
          CANCEL: t("cancel"),
          /** @default "Change Password" */
          CHANGE_PASSWORD: t("change-password"),
          /** @default "Enter your current password and a new password." */
          CHANGE_PASSWORD_DESCRIPTION: t("change-password-description"),
          /** @default "Please use 8 characters at minimum." */
          CHANGE_PASSWORD_INSTRUCTIONS: t("change-password-instructions"),
          /** @default "Your password has been changed." */
          CHANGE_PASSWORD_SUCCESS: t("change-password-success"),
          /** @default "Confirm Password" */
          CONFIRM_PASSWORD: t("confirm-password"),
          /** @default "Confirm Password" */
          CONFIRM_PASSWORD_PLACEHOLDER: t("confirm-password-placeholder"),
          /** @default "Confirm password is required" */
          CONFIRM_PASSWORD_REQUIRED: t("confirm-password-required"),
          /** @default "Continue with Authenticator" */
          CONTINUE_WITH_AUTHENTICATOR: t("continue-with-authenticator"),
          /** @default "Copied to clipboard" */
          COPIED_TO_CLIPBOARD: t("copied-to-clipboard"),
          /** @default "Copy to clipboard" */
          COPY_TO_CLIPBOARD: t("copy-to-clipboard"),
          /** @default "Copy all codes" */
          COPY_ALL_CODES: t("copy-all-codes"),
          /** @default "Continue" */
          CONTINUE: t("continue"),
          /** @default "Current Password" */
          CURRENT_PASSWORD: t("current-password"),
          /** @default "Current Password" */
          CURRENT_PASSWORD_PLACEHOLDER: t("current-password-placeholder"),
          /** @default "Current Session" */
          CURRENT_SESSION: t("current-session"),
          /** @default "Delete" */
          DELETE: t("delete"),
          /** @default "Delete Avatar" */
          DELETE_AVATAR: t("delete-avatar"),
          /** @default "Delete Account" */
          DELETE_ACCOUNT: t("delete-account"),
          /** @default "Permanently remove your account and all of its contents. This action is not reversible, so please continue with caution." */
          DELETE_ACCOUNT_DESCRIPTION: t("delete-account-description"),
          /** @default "Please confirm the deletion of your account. This action is not reversible, so please continue with caution." */
          DELETE_ACCOUNT_INSTRUCTIONS: t("delete-account-instructions"),
          /** @default "Please check your email to verify the deletion of your account." */
          DELETE_ACCOUNT_VERIFY: t("delete-account-verify"),
          /** @default "Your account has been deleted." */
          DELETE_ACCOUNT_SUCCESS: t("delete-account-success"),
          /** @default "You must be recently logged in to delete your account." */
          DELETE_ACCOUNT_NOT_FRESH: t("delete-account-not-fresh"),
          /** @default "Disable" */
          DISABLE: t("disable"),
          /** @default "Choose a provider to login to your account" */
          DISABLED_CREDENTIALS_DESCRIPTION: t(
            "disabled-credentials-description"
          ),
          /** @default "Don't have an account?" */
          DONT_HAVE_AN_ACCOUNT: t("dont-have-account"),
          /** @default "Done" */
          DONE: t("done"),
          /** @default "Email" */
          EMAIL: t("email"),
          /** @default "Enter the email address you want to use to log in." */
          EMAIL_DESCRIPTION: t("email-description"),
          /** @default "Please enter a valid email address." */
          EMAIL_INSTRUCTIONS: t("email-instructions"),
          /** @default "Email address is invalid" */
          EMAIL_INVALID: t("email-invalid"),
          /** @default "Email is the same" */
          EMAIL_IS_THE_SAME: t("email-is-the-same"),
          /** @default "m@example.com" */
          EMAIL_PLACEHOLDER: t("email-placeholder"),
          /** @default "Email address is required" */
          EMAIL_REQUIRED: t("email-required"),
          /** @default "Please check your email to verify the change." */
          EMAIL_VERIFY_CHANGE: t("email-verify-change"),
          /** @default "Please check your email for the verification link." */
          EMAIL_VERIFICATION: t("email-verification"),
          /** @default "Enable" */
          ENABLE: t("enable"),
          /** @default "Error" */
          ERROR: t("error"),
          /** @default "is invalid" */
          IS_INVALID: t("is-invalid"),
          /** @default "is required" */
          IS_REQUIRED: t("is-required"),
          /** @default "is the same" */
          IS_THE_SAME: t("is-the-same"),
          /** @default "Forgot authenticator?" */
          FORGOT_AUTHENTICATOR: t("forgot-authenticator"),
          /** @default "Forgot Password" */
          FORGOT_PASSWORD: t("forgot-password"),
          /** @default "Send reset link" */
          FORGOT_PASSWORD_ACTION: t("forgot-password-action"),
          /** @default "Enter your email to reset your password" */
          FORGOT_PASSWORD_DESCRIPTION: t("forgot-password-description"),
          /** @default "Check your email for the password reset link." */
          FORGOT_PASSWORD_EMAIL: t("forgot-password-email"),
          /** @default "Forgot your password?" */
          FORGOT_PASSWORD_LINK: t("forgot-password-link"),
          /** @default "Invalid two factor cookie" */
          INVALID_TWO_FACTOR_COOKIE: t("invalid-two-factor-cookie"),
          /** @default "Link" */
          LINK: t("link"),
          /** @default "Magic Link" */
          MAGIC_LINK: t("magic-link"),
          /** @default "Send magic link" */
          MAGIC_LINK_ACTION: t("magic-link-action"),
          /** @default "Enter your email to receive a magic link" */
          MAGIC_LINK_DESCRIPTION: t("magic-link-description"),
          /** @default "Check your email for the magic link" */
          MAGIC_LINK_EMAIL: t("magic-link-email"),
          /** @default "Email Code" */
          EMAIL_OTP: t("email-otp"),
          /** @default "Send code" */
          EMAIL_OTP_SEND_ACTION: t("email-otp-send-action"),
          /** @default "Verify code" */
          EMAIL_OTP_VERIFY_ACTION: t("email-otp-verify-action"),
          /** @default "Enter your email to receive a code" */
          EMAIL_OTP_DESCRIPTION: t("email-otp-description"),
          /** @default "Please check your email for the verification code." */
          EMAIL_OTP_VERIFICATION_SENT: t("email-otp-verification-sent"),
          /** @default "Name" */
          NAME: t("name"),
          /** @default "Please enter your full name, or a display name." */
          NAME_DESCRIPTION: t("name-description"),
          /** @default "Please use 32 characters at maximum." */
          NAME_INSTRUCTIONS: t("name-instructions"),
          /** @default "Name" */
          NAME_PLACEHOLDER: t("name-placeholder"),
          /** @default "New Password" */
          NEW_PASSWORD: t("new-password"),
          /** @default "New Password" */
          NEW_PASSWORD_PLACEHOLDER: t("new-password-placeholder"),
          /** @default "New password is required" */
          NEW_PASSWORD_REQUIRED: t("new-password-required"),
          /** @default "One-Time Password" */
          ONE_TIME_PASSWORD: t("one-time-password"),
          /** @default "Or continue with" */
          OR_CONTINUE_WITH: t("or-continue-with"),
          /** @default "Passkey" */
          PASSKEY: t("passkey"),
          /** @default "Passkeys" */
          PASSKEYS: t("passkeys"),
          /** @default "Manage your passkeys for secure access." */
          PASSKEYS_DESCRIPTION: t("passkeys-description"),
          /** @default "Securely access your account without a password." */
          PASSKEYS_INSTRUCTIONS: t("passkeys-instructions"),
          /** @default "API Keys" */
          API_KEYS: t("api-keys"),
          /** @default "Manage your API keys for secure access." */
          API_KEYS_DESCRIPTION: t("api-keys-description"),
          /** @default "Generate API keys to access your account programmatically." */
          API_KEYS_INSTRUCTIONS: t("api-keys-instructions"),
          /** @default "Create API Key" */
          CREATE_API_KEY: t("create-api-key"),
          /** @default "Enter a unique name for your API key to differentiate it from other keys." */
          CREATE_API_KEY_DESCRIPTION: t("create-api-key-description"),
          /** @default "New API Key" */
          API_KEY_NAME_PLACEHOLDER: t("api-key-name-placeholder"),
          /** @default "API Key Created" */
          API_KEY_CREATED: t("api-key-created"),
          /** @default "Please copy your API key and store it in a safe place. For security reasons we cannot show it again." */
          API_KEY_CREATED_DESCRIPTION: t("api-key-created-description"),
          /** @default "Never Expires" */
          NEVER_EXPIRES: t("never-expires"),
          /** @default "Expires" */
          EXPIRES: t("expires"),
          /** @default "No Expiration" */
          NO_EXPIRATION: t("no-expiration"),
          /** @default "Create" */
          CREATE: t("create"),
          /** @default "Password" */
          PASSWORD: t("password"),
          /** @default "Password" */
          PASSWORD_PLACEHOLDER: t("password-placeholder"),
          /** @default "Password is required" */
          PASSWORD_REQUIRED: t("password-required"),
          /** @default "Passwords do not match" */
          PASSWORDS_DO_NOT_MATCH: t("passwords-do-not-match"),
          /** @default "Providers" */
          PROVIDERS: t("providers"),
          /** @default "Connect your account with a third-party service." */
          PROVIDERS_DESCRIPTION: t("providers-description"),
          /** @default "Recover Account" */
          RECOVER_ACCOUNT: t("recover-account"),
          /** @default "Recover account" */
          RECOVER_ACCOUNT_ACTION: t("recover-account-action"),
          /** @default "Please enter a backup code to access your account" */
          RECOVER_ACCOUNT_DESCRIPTION: t("recover-account-description"),
          /** @default "Remember me" */
          REMEMBER_ME: t("remember-me"),
          /** @default "Resend code" */
          RESEND_CODE: t("resend-code"),
          /** @default "Resend verification email" */
          RESEND_VERIFICATION_EMAIL: t("resend-verification-email"),
          /** @default "Reset Password" */
          RESET_PASSWORD: t("reset-password"),
          /** @default "Save new password" */
          RESET_PASSWORD_ACTION: t("reset-password-action"),
          /** @default "Enter your new password below" */
          RESET_PASSWORD_DESCRIPTION: t("reset-password-description"),
          /** @default "Invalid reset password link" */
          RESET_PASSWORD_INVALID_TOKEN: t("reset-password-invalid-token"),
          /** @default "Password reset successfully" */
          RESET_PASSWORD_SUCCESS: t("reset-password-success"),
          /** @default "Request failed" */
          REQUEST_FAILED: t("request-failed"),
          /** @default "Revoke" */
          REVOKE: t("revoke"),
          /** @default "Delete API Key" */
          DELETE_API_KEY: t("delete-api-key"),
          /** @default "Are you sure you want to delete this API key?" */
          DELETE_API_KEY_CONFIRMATION: t("delete-api-key-confirmation"),
          /** @default "API Key" */
          API_KEY: t("api-key"),
          /** @default "Sign In" */
          SIGN_IN: t("sign-in"),
          /** @default "Login" */
          SIGN_IN_ACTION: t("sign-in-action"),
          /** @default "Enter your email below to login to your account" */
          SIGN_IN_DESCRIPTION: t("sign-in-description"),
          /** @default "Enter your username or email below to login to your account" */
          SIGN_IN_USERNAME_DESCRIPTION: t("sign-in-username-description"),
          /** @default "Sign in with" */
          SIGN_IN_WITH: t("sign-in-with"),
          /** @default "Sign Out" */
          SIGN_OUT: t("sign-out"),
          /** @default "Sign Up" */
          SIGN_UP: t("sign-up"),
          /** @default "Create an account" */
          SIGN_UP_ACTION: t("sign-up-action"),
          /** @default "Enter your information to create an account" */
          SIGN_UP_DESCRIPTION: t("sign-up-description"),
          /** @default "Check your email for the verification link." */
          SIGN_UP_EMAIL: t("sign-up-email"),
          /** @default "Sessions" */
          SESSIONS: t("sessions"),
          /** @default "Manage your active sessions and revoke access." */
          SESSIONS_DESCRIPTION: t("sessions-description"),
          /** @default "Set Password" */
          SET_PASSWORD: t("set-password"),
          /** @default "Click the button below to receive an email to set up a password for your account." */
          SET_PASSWORD_DESCRIPTION: t("set-password-description"),
          /** @default "Settings" */
          SETTINGS: t("settings"),
          /** @default "Save" */
          SAVE: t("save"),
          /** @default "Security" */
          SECURITY: t("security"),
          /** @default "Switch Account" */
          SWITCH_ACCOUNT: t("switch-account"),
          /** @default "Trust this device" */
          TRUST_DEVICE: t("trust-device"),
          /** @default "Two-Factor" */
          TWO_FACTOR: t("two-factor"),
          /** @default "Verify code" */
          TWO_FACTOR_ACTION: t("two-factor-action"),
          /** @default "Please enter your one-time password to continue" */
          TWO_FACTOR_DESCRIPTION: t("two-factor-description"),
          /** @default "Add an extra layer of security to your account." */
          TWO_FACTOR_CARD_DESCRIPTION: t("two-factor-card-description"),
          /** @default "Please enter your password to disable 2FA." */
          TWO_FACTOR_DISABLE_INSTRUCTIONS: t("two-factor-disable-instructions"),
          /** @default "Please enter your password to enable 2FA" */
          TWO_FACTOR_ENABLE_INSTRUCTIONS: t("two-factor-enable-instructions"),
          /** @default "Two-factor authentication has been enabled" */
          TWO_FACTOR_ENABLED: t("two-factor-enabled"),
          /** @default "Two-Factor Authentication has been disabled" */
          TWO_FACTOR_DISABLED: t("two-factor-disabled"),
          /** @default "Two-Factor Authentication" */
          TWO_FACTOR_PROMPT: t("two-factor-prompt"),
          /** @default "Scan the QR Code with your Authenticator" */
          TWO_FACTOR_TOTP_LABEL: t("two-factor-totp-label"),
          /** @default "Send verification code" */
          SEND_VERIFICATION_CODE: t("send-verification-code"),
          /** @default "Unlink" */
          UNLINK: t("unlink"),
          /** @default "Updated successfully" */
          UPDATED_SUCCESSFULLY: t("updated-successfully"),
          /** @default "Username" */
          USERNAME: t("username"),
          /** @default "Enter the username you want to use to log in." */
          USERNAME_DESCRIPTION: t("username-description"),
          /** @default "Please use 32 characters at maximum." */
          USERNAME_INSTRUCTIONS: t("username-instructions"),
          /** @default "Username" */
          USERNAME_PLACEHOLDER: t("username-placeholder"),
          /** @default "Username or email" */
          SIGN_IN_USERNAME_PLACEHOLDER: t("sign-in-username-placeholder"),
          /** @default "Verify Your Email" */
          VERIFY_YOUR_EMAIL: t("verify-your-email"),
          /** @default "Please verify your email address. Check your inbox for the verification email. If you haven't received the email, click the button below to resend." */
          VERIFY_YOUR_EMAIL_DESCRIPTION: t("verify-your-email-description"),
          /** @default "Go back" */
          GO_BACK: t("go-back"),
          /** @default "Invalid email or password" */
          INVALID_EMAIL_OR_PASSWORD: t("invalid-email-or-password"),
          /** @default "Invalid password" */
          PASSWORD_INVALID: t("password-invalid"),
          /** @default "Your session is not fresh. Please sign in again." */
          SESSION_NOT_FRESH: t("session-not-fresh"),
          /** @default "Session Expired" */
          SESSION_EXPIRED: t("session-expired"),
          /** @default "Password too short" */
          PASSWORD_TOO_SHORT: t("password-too-short"),
          /** @default "Password too long" */
          PASSWORD_TOO_LONG: t("password-too-long"),
          /** @default "Upload Avatar" */
          UPLOAD_AVATAR: t("upload-avatar"),
          /** @default "Privacy Policy" */
          PRIVACY_POLICY: t("privacy-policy"),
          /** @default "Terms of Service" */
          TERMS_OF_SERVICE: t("terms-of-service"),
          /** @default "This site is protected by reCAPTCHA." */
          PROTECTED_BY_RECAPTCHA: t("protected-by-recaptcha"),
          /** @default "By continuing, you agree to the" */
          BY_CONTINUING_YOU_AGREE: t("by-continuing-you-agree"),
          /** @default "Missing CAPTCHA response" */
          MISSING_CAPTCHA_RESPONSE: t("missing-captcha-response"),
        }}
      >
        <div className="AuthProvider">{children}</div>
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
};
