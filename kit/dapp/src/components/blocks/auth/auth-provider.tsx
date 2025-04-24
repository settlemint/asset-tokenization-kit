"use client";

import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import {
  AuthUIProvider,
  type AuthUIProviderProps,
} from "@daveyplate/better-auth-ui";
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
    <AuthUIProvider
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
        account: t("account"),
        addAccount: t("add-account"),
        alreadyHaveAnAccount: t("already-have-account"),
        avatar: t("avatar"),
        avatarDescription: t("avatar-description"),
        avatarInstructions: t("avatar-instructions"),
        changePassword: t("change-password"),
        changePasswordDescription: t("change-password-description"),
        changePasswordInstructions: t("change-password-instructions"),
        changePasswordSuccess: t("change-password-success"),
        currentPassword: t("current-password"),
        currentPasswordPlaceholder: t("current-password-placeholder"),
        currentSession: t("current-session"),
        deleteAccount: t("delete-account"),
        deleteAccountDescription: t("delete-account-description"),
        deleteAccountInstructions: t("delete-account-instructions"),
        deleteAccountSuccess: t("delete-account-success"),
        deleteAccountNotFresh: t("delete-account-not-fresh"),
        disabledCredentialsDescription: t("disabled-credentials-description"),
        dontHaveAnAccount: t("dont-have-account"),
        email: t("email"),
        emailDescription: t("email-description"),
        emailInstructions: t("email-instructions"),
        emailPlaceholder: t("email-placeholder"),
        emailVerifyChange: t("email-verify-change"),
        emailVerification: t("email-verification"),
        forgotPassword: t("forgot-password"),
        forgotPasswordAction: t("forgot-password-action"),
        forgotPasswordDescription: t("forgot-password-description"),
        forgotPasswordEmail: t("forgot-password-email"),
        forgotPasswordLink: t("forgot-password-link"),
        link: t("link"),
        magicLink: t("magic-link"),
        magicLinkAction: t("magic-link-action"),
        magicLinkDescription: t("magic-link-description"),
        magicLinkEmail: t("magic-link-email"),
        name: t("name"),
        nameDescription: t("name-description"),
        nameInstructions: t("name-instructions"),
        namePlaceholder: t("name-placeholder"),
        newPassword: t("new-password"),
        newPasswordPlaceholder: t("new-password-placeholder"),
        passkey: t("passkey"),
        password: t("password"),
        passwordPlaceholder: t("password-placeholder"),
        providers: t("providers"),
        providersDescription: t("providers-description"),
        rememberMe: t("remember-me"),
        resetPassword: t("reset-password"),
        resetPasswordAction: t("reset-password-action"),
        resetPasswordDescription: t("reset-password-description"),
        resetPasswordInvalidToken: t("reset-password-invalid-token"),
        resetPasswordSuccess: t("reset-password-success"),
        revoke: t("revoke"),
        signIn: t("sign-in"),
        signInAction: t("sign-in-action"),
        signInDescription: t("sign-in-description"),
        signInUsernameDescription: t("sign-in-username-description"),
        signInWith: t("sign-in-with"),
        signOut: t("sign-out"),
        signUp: t("sign-up"),
        signUpAction: t("sign-up-action"),
        signUpDescription: t("sign-up-description"),
        signUpEmail: t("sign-up-email"),
        sessions: t("sessions"),
        sessionsDescription: t("sessions-description"),
        setPassword: t("set-password"),
        setPasswordDescription: t("set-password-description"),
        settings: t("settings"),
        save: t("save"),
        unlink: t("unlink"),
        username: t("username"),
        usernameDescription: t("username-description"),
        usernameInstructions: t("username-instructions"),
        usernamePlaceholder: t("username-placeholder"),
        passkeys: t("passkeys"),
        passkeysDescription: t("passkeys-description"),
        passkeysInstructions: t("passkeys-instructions"),
        addPasskey: t("add-passkey"),
        verifyYourEmail: t("verify-your-email"),
        verifyYourEmailDescription: t("verify-your-email-description"),
        accounts: t("accounts"),
        accountsDescription: t("accounts-description"),
        accountsInstructions: t("accounts-instructions"),
        delete: t("delete"),
        resendVerificationEmail: t("resend-verification-email"),
        security: t("security"),
        switchAccount: t("switch-account"),
        backupCodeRequired: t("backup-code-required"),
        backupCodes: t("backup-codes"),
        backupCodesDescription: t("backup-codes-description"),
        backupCodePlaceholder: t("backup-code-placeholder"),
        backupCode: t("backup-code"),
        backupCodeAction: t("backup-code-action"),
        cancel: t("cancel"),
        confirmPassword: t("confirm-password"),
        confirmPasswordPlaceholder: t("confirm-password-placeholder"),
        confirmPasswordRequired: t("confirm-password-required"),
        continueWithAuthenticator: t("continue-with-authenticator"),
        copiedToClipboard: t("copied-to-clipboard"),
        copyAllCodes: t("copy-all-codes"),
        continue: t("continue"),
        deleteAccountVerify: t("delete-account-verify"),
        disable: t("disable"),
        emailInvalid: t("email-invalid"),
        emailIsTheSame: t("email-is-the-same"),
        emailRequired: t("email-required"),
        enable: t("enable"),
        error: t("error"),
        isInvalid: t("is-invalid"),
        isRequired: t("is-required"),
        isTheSame: t("is-the-same"),
        forgotAuthenticator: t("forgot-authenticator"),
        invalidTwoFactorCookie: t("invalid-two-factor-cookie"),
        newPasswordRequired: t("new-password-required"),
        oneTimePassword: t("one-time-password"),
        orContinueWith: t("or-continue-with"),
        passwordRequired: t("password-required"),
        passwordsDoNotMatch: t("passwords-do-not-match"),
        recoverAccount: t("recover-account"),
        recoverAccountAction: t("recover-account-action"),
        recoverAccountDescription: t("recover-account-description"),
        resendCode: t("resend-code"),
        requestFailed: t("request-failed"),
        trustDevice: t("trust-this-device"),
        twoFactor: t("two-factor"),
        twoFactorAction: t("two-factor-action"),
        twoFactorDescription: t("two-factor-description"),
        twoFactorCardDescription: t("two-factor-card-description"),
        twoFactorDisableInstructions: t("two-factor-disable-instructions"),
        twoFactorEnableInstructions: t("two-factor-enable-instructions"),
        twoFactorEnabled: t("two-factor-enabled"),
        twoFactorDisabled: t("two-factor-disabled"),
        twoFactorPrompt: t("two-factor-prompt"),
        twoFactorTotpLabel: t("two-factor-totp-label"),
        sendVerificationCode: t("send-verification-code"),
        updatedSuccessfully: t("updated-successfully"),
        signInUsernamePlaceholder: t("sign-in-username-placeholder"),
        goBack: t("go-back"),
        invalidPassword: t("invalid-password"),
        passwordTooShort: t("password-too-short"),
      }}
    >
      {children}
    </AuthUIProvider>
  );
};
