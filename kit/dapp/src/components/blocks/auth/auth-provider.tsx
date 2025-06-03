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

  const providers: AuthUIProviderProps["providers"] = [];
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
        settingsURL="/portfolio/settings/profile"
        redirectTo="/portfolio"
        confirmPassword={true}
        optimistic={true}
        rememberMe={true}
        forgotPassword={emailEnabled}
        deleteAccountVerification={emailEnabled}
        deleteUser={true}
        avatar={false}
        magicLink={emailEnabled}
        passkey={true}
        providers={providers.length > 0 ? providers : undefined}
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
          account: t("account"),
          /** @default "Accounts" */
          accounts: t("accounts"),
          /** @default "Manage your currently signed in accounts." */
          accountsDescription: t("accounts-description"),
          /** @default "Sign in to an additional account." */
          accountsInstructions: t("accounts-instructions"),
          /** @default "Add Account" */
          addAccount: t("add-account"),
          /** @default "Add Passkey" */
          addPasskey: t("add-passkey"),
          /** @default "Already have an account?" */
          alreadyHaveAnAccount: t("already-have-account"),
          /** @default "Avatar" */
          avatar: t("avatar"),
          /** @default "Click on the avatar to upload a custom one from your files." */
          avatarDescription: t("avatar-description"),
          /** @default "An avatar is optional but strongly recommended." */
          avatarInstructions: t("avatar-instructions"),
          /** @default "Backup code is required" */
          backupCodeRequired: t("backup-code-required"),
          /** @default "Backup Codes" */
          backupCodes: t("backup-codes"),
          /** @default "Save these backup codes in a secure place. You can use them to access your account if you lose your two-factor authentication method." */
          backupCodesDescription: t("backup-codes-description"),
          /** @default "Enter one of your backup codes. Once used, each code can only be used once and will be invalidated after use." */
          backupCodePlaceholder: t("backup-code-placeholder"),
          /** @default "Backup Code" */
          backupCode: t("backup-code"),
          /** @default "Recover account" */
          backupCodeAction: t("backup-code-action"),
          /** @default "Cancel" */
          cancel: t("cancel"),
          /** @default "Change Password" */
          changePassword: t("change-password"),
          /** @default "Enter your current password and a new password." */
          changePasswordDescription: t("change-password-description"),
          /** @default "Please use 8 characters at minimum." */
          changePasswordInstructions: t("change-password-instructions"),
          /** @default "Your password has been changed." */
          changePasswordSuccess: t("change-password-success"),
          /** @default "Confirm Password" */
          confirmPassword: t("confirm-password"),
          /** @default "Confirm Password" */
          confirmPasswordPlaceholder: t("confirm-password-placeholder"),
          /** @default "Confirm password is required" */
          confirmPasswordRequired: t("confirm-password-required"),
          /** @default "Continue with Authenticator" */
          continueWithAuthenticator: t("continue-with-authenticator"),
          /** @default "Copied to clipboard" */
          copiedToClipboard: t("copied-to-clipboard"),
          /** @default "Copy to clipboard" */
          copyToClipboard: t("copy-to-clipboard"),
          /** @default "Copy all codes" */
          copyAllCodes: t("copy-all-codes"),
          /** @default "Continue" */
          continue: t("continue"),
          /** @default "Current Password" */
          currentPassword: t("current-password"),
          /** @default "Current Password" */
          currentPasswordPlaceholder: t("current-password-placeholder"),
          /** @default "Current Session" */
          currentSession: t("current-session"),
          /** @default "Delete" */
          delete: t("delete"),
          /** @default "Delete Avatar" */
          deleteAvatar: t("delete-avatar"),
          /** @default "Delete Account" */
          deleteAccount: t("delete-account"),
          /** @default "Permanently remove your account and all of its contents. This action is not reversible, so please continue with caution." */
          deleteAccountDescription: t("delete-account-description"),
          /** @default "Please confirm the deletion of your account. This action is not reversible, so please continue with caution." */
          deleteAccountInstructions: t("delete-account-instructions"),
          /** @default "Please check your email to verify the deletion of your account." */
          deleteAccountVerify: t("delete-account-verify"),
          /** @default "Your account has been deleted." */
          deleteAccountSuccess: t("delete-account-success"),
          /** @default "You must be recently logged in to delete your account." */
          deleteAccountNotFresh: t("delete-account-not-fresh"),
          /** @default "Disable" */
          disable: t("disable"),
          /** @default "Choose a provider to login to your account" */
          disabledCredentialsDescription: t("disabled-credentials-description"),
          /** @default "Don't have an account?" */
          dontHaveAnAccount: t("dont-have-account"),
          /** @default "Done" */
          done: t("done"),
          /** @default "Email" */
          email: t("email"),
          /** @default "Enter the email address you want to use to log in." */
          emailDescription: t("email-description"),
          /** @default "Please enter a valid email address." */
          emailInstructions: t("email-instructions"),
          /** @default "Email address is invalid" */
          emailInvalid: t("email-invalid"),
          /** @default "Email is the same" */
          emailIsTheSame: t("email-is-the-same"),
          /** @default "m@example.com" */
          emailPlaceholder: t("email-placeholder"),
          /** @default "Email address is required" */
          emailRequired: t("email-required"),
          /** @default "Please check your email to verify the change." */
          emailVerifyChange: t("email-verify-change"),
          /** @default "Please check your email for the verification link." */
          emailVerification: t("email-verification"),
          /** @default "Enable" */
          enable: t("enable"),
          /** @default "Error" */
          error: t("error"),
          /** @default "is invalid" */
          isInvalid: t("is-invalid"),
          /** @default "is required" */
          isRequired: t("is-required"),
          /** @default "is the same" */
          isTheSame: t("is-the-same"),
          /** @default "Forgot authenticator?" */
          forgotAuthenticator: t("forgot-authenticator"),
          /** @default "Forgot Password" */
          forgotPassword: t("forgot-password"),
          /** @default "Send reset link" */
          forgotPasswordAction: t("forgot-password-action"),
          /** @default "Enter your email to reset your password" */
          forgotPasswordDescription: t("forgot-password-description"),
          /** @default "Check your email for the password reset link." */
          forgotPasswordEmail: t("forgot-password-email"),
          /** @default "Forgot your password?" */
          forgotPasswordLink: t("forgot-password-link"),
          /** @default "Invalid two factor cookie" */
          invalidTwoFactorCookie: t("invalid-two-factor-cookie"),
          /** @default "Link" */
          link: t("link"),
          /** @default "Magic Link" */
          magicLink: t("magic-link"),
          /** @default "Send magic link" */
          magicLinkAction: t("magic-link-action"),
          /** @default "Enter your email to receive a magic link" */
          magicLinkDescription: t("magic-link-description"),
          /** @default "Check your email for the magic link" */
          magicLinkEmail: t("magic-link-email"),
          /** @default "Email Code" */
          emailOTP: t("email-otp"),
          /** @default "Send code" */
          emailOTPSendAction: t("email-otp-send-action"),
          /** @default "Verify code" */
          emailOTPVerifyAction: t("email-otp-verify-action"),
          /** @default "Enter your email to receive a code" */
          emailOTPDescription: t("email-otp-description"),
          /** @default "Please check your email for the verification code." */
          emailOTPVerificationSent: t("email-otp-verification-sent"),
          /** @default "Name" */
          name: t("name"),
          /** @default "Please enter your full name, or a display name." */
          nameDescription: t("name-description"),
          /** @default "Please use 32 characters at maximum." */
          nameInstructions: t("name-instructions"),
          /** @default "Name" */
          namePlaceholder: t("name-placeholder"),
          /** @default "New Password" */
          newPassword: t("new-password"),
          /** @default "New Password" */
          newPasswordPlaceholder: t("new-password-placeholder"),
          /** @default "New password is required" */
          newPasswordRequired: t("new-password-required"),
          /** @default "One-Time Password" */
          oneTimePassword: t("one-time-password"),
          /** @default "Or continue with" */
          orContinueWith: t("or-continue-with"),
          /** @default "Passkey" */
          passkey: t("passkey"),
          /** @default "Passkeys" */
          passkeys: t("passkeys"),
          /** @default "Manage your passkeys for secure access." */
          passkeysDescription: t("passkeys-description"),
          /** @default "Securely access your account without a password." */
          passkeysInstructions: t("passkeys-instructions"),
          /** @default "API Keys" */
          apiKeys: t("api-keys"),
          /** @default "Manage your API keys for secure access." */
          apiKeysDescription: t("api-keys-description"),
          /** @default "Generate API keys to access your account programmatically." */
          apiKeysInstructions: t("api-keys-instructions"),
          /** @default "Create API Key" */
          createApiKey: t("create-api-key"),
          /** @default "Enter a unique name for your API key to differentiate it from other keys." */
          createApiKeyDescription: t("create-api-key-description"),
          /** @default "New API Key" */
          apiKeyNamePlaceholder: t("api-key-name-placeholder"),
          /** @default "API Key Created" */
          apiKeyCreated: t("api-key-created"),
          /** @default "Please copy your API key and store it in a safe place. For security reasons we cannot show it again." */
          apiKeyCreatedDescription: t("api-key-created-description"),
          /** @default "Never Expires" */
          neverExpires: t("never-expires"),
          /** @default "Expires" */
          expires: t("expires"),
          /** @default "No Expiration" */
          noExpiration: t("no-expiration"),
          /** @default "Create" */
          create: t("create"),
          /** @default "Password" */
          password: t("password"),
          /** @default "Password" */
          passwordPlaceholder: t("password-placeholder"),
          /** @default "Password is required" */
          passwordRequired: t("password-required"),
          /** @default "Passwords do not match" */
          passwordsDoNotMatch: t("passwords-do-not-match"),
          /** @default "Providers" */
          providers: t("providers"),
          /** @default "Connect your account with a third-party service." */
          providersDescription: t("providers-description"),
          /** @default "Recover Account" */
          recoverAccount: t("recover-account"),
          /** @default "Recover account" */
          recoverAccountAction: t("recover-account-action"),
          /** @default "Please enter a backup code to access your account" */
          recoverAccountDescription: t("recover-account-description"),
          /** @default "Remember me" */
          rememberMe: t("remember-me"),
          /** @default "Resend code" */
          resendCode: t("resend-code"),
          /** @default "Resend verification email" */
          resendVerificationEmail: t("resend-verification-email"),
          /** @default "Reset Password" */
          resetPassword: t("reset-password"),
          /** @default "Save new password" */
          resetPasswordAction: t("reset-password-action"),
          /** @default "Enter your new password below" */
          resetPasswordDescription: t("reset-password-description"),
          /** @default "Invalid reset password link" */
          resetPasswordInvalidToken: t("reset-password-invalid-token"),
          /** @default "Password reset successfully" */
          resetPasswordSuccess: t("reset-password-success"),
          /** @default "Request failed" */
          requestFailed: t("request-failed"),
          /** @default "Revoke" */
          revoke: t("revoke"),
          /** @default "Delete API Key" */
          deleteApiKey: t("delete-api-key"),
          /** @default "Are you sure you want to delete this API key?" */
          deleteApiKeyConfirmation: t("delete-api-key-confirmation"),
          /** @default "API Key" */
          apiKey: t("api-key"),
          /** @default "Sign In" */
          signIn: t("sign-in"),
          /** @default "Login" */
          signInAction: t("sign-in-action"),
          /** @default "Enter your email below to login to your account" */
          signInDescription: t("sign-in-description"),
          /** @default "Enter your username or email below to login to your account" */
          signInUsernameDescription: t("sign-in-username-description"),
          /** @default "Sign in with" */
          signInWith: t("sign-in-with"),
          /** @default "Sign Out" */
          signOut: t("sign-out"),
          /** @default "Sign Up" */
          signUp: t("sign-up"),
          /** @default "Create an account" */
          signUpAction: t("sign-up-action"),
          /** @default "Enter your information to create an account" */
          signUpDescription: t("sign-up-description"),
          /** @default "Check your email for the verification link." */
          signUpEmail: t("sign-up-email"),
          /** @default "Sessions" */
          sessions: t("sessions"),
          /** @default "Manage your active sessions and revoke access." */
          sessionsDescription: t("sessions-description"),
          /** @default "Set Password" */
          setPassword: t("set-password"),
          /** @default "Click the button below to receive an email to set up a password for your account." */
          setPasswordDescription: t("set-password-description"),
          /** @default "Settings" */
          settings: t("settings"),
          /** @default "Save" */
          save: t("save"),
          /** @default "Security" */
          security: t("security"),
          /** @default "Switch Account" */
          switchAccount: t("switch-account"),
          /** @default "Trust this device" */
          trustDevice: t("trust-device"),
          /** @default "Two-Factor" */
          twoFactor: t("two-factor"),
          /** @default "Verify code" */
          twoFactorAction: t("two-factor-action"),
          /** @default "Please enter your one-time password to continue" */
          twoFactorDescription: t("two-factor-description"),
          /** @default "Add an extra layer of security to your account." */
          twoFactorCardDescription: t("two-factor-card-description"),
          /** @default "Please enter your password to disable 2FA." */
          twoFactorDisableInstructions: t("two-factor-disable-instructions"),
          /** @default "Please enter your password to enable 2FA" */
          twoFactorEnableInstructions: t("two-factor-enable-instructions"),
          /** @default "Two-factor authentication has been enabled" */
          twoFactorEnabled: t("two-factor-enabled"),
          /** @default "Two-Factor Authentication has been disabled" */
          twoFactorDisabled: t("two-factor-disabled"),
          /** @default "Two-Factor Authentication" */
          twoFactorPrompt: t("two-factor-prompt"),
          /** @default "Scan the QR Code with your Authenticator" */
          twoFactorTotpLabel: t("two-factor-totp-label"),
          /** @default "Send verification code" */
          sendVerificationCode: t("send-verification-code"),
          /** @default "Unlink" */
          unlink: t("unlink"),
          /** @default "Updated successfully" */
          updatedSuccessfully: t("updated-successfully"),
          /** @default "Username" */
          username: t("username"),
          /** @default "Enter the username you want to use to log in." */
          usernameDescription: t("username-description"),
          /** @default "Please use 32 characters at maximum." */
          usernameInstructions: t("username-instructions"),
          /** @default "Username" */
          usernamePlaceholder: t("username-placeholder"),
          /** @default "Username or email" */
          signInUsernamePlaceholder: t("sign-in-username-placeholder"),
          /** @default "Verify Your Email" */
          verifyYourEmail: t("verify-your-email"),
          /** @default "Please verify your email address. Check your inbox for the verification email. If you haven't received the email, click the button below to resend." */
          verifyYourEmailDescription: t("verify-your-email-description"),
          /** @default "Go back" */
          goBack: t("go-back"),
          /** @default "Invalid email or password" */
          invalidEmailOrPassword: t("invalid-email-or-password"),
          /** @default "Invalid password" */
          passwordInvalid: t("password-invalid"),
          /** @default "Your session is not fresh. Please sign in again." */
          sessionNotFresh: t("session-not-fresh"),
          /** @default "Session Expired" */
          sessionExpired: t("session-expired"),
          /** @default "Password too short" */
          passwordTooShort: t("password-too-short"),
          /** @default "Password too long" */
          passwordTooLong: t("password-too-long"),
          /** @default "Upload Avatar" */
          uploadAvatar: t("upload-avatar"),
          /** @default "Privacy Policy" */
          privacyPolicy: t("privacy-policy"),
          /** @default "Terms of Service" */
          termsOfService: t("terms-of-service"),
          /** @default "This site is protected by reCAPTCHA." */
          protectedByRecaptcha: t("protected-by-recaptcha"),
          /** @default "By continuing, you agree to the" */
          byContinuingYouAgree: t("by-continuing-you-agree"),
          /** @default "Missing CAPTCHA response" */
          missingCaptchaResponse: t("missing-captcha-response"),
        }}
      >
        <div className="AuthProvider">{children}</div>
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
};
