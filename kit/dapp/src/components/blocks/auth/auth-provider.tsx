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
        localization={{
          {
            INVALID_USERNAME_OR_PASSWORD: string;
            EMAIL_NOT_VERIFIED: string;
            UNEXPECTED_ERROR: string;
            USERNAME_IS_ALREADY_TAKEN: string;
            USERNAME_TOO_SHORT: string;
            USERNAME_TOO_LONG: string;
            INVALID_USERNAME: string;
            OTP_NOT_ENABLED: "OTP not enabled";
            OTP_HAS_EXPIRED: "OTP has expired";
            TOTP_NOT_ENABLED: "TOTP not enabled";
            TWO_FACTOR_NOT_ENABLED: "Two factor isn't enabled";
            BACKUP_CODES_NOT_ENABLED: "Backup codes aren't enabled";
            INVALID_BACKUP_CODE: "Invalid backup code";
            INVALID_CODE: "Invalid code";
            TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many attempts. Please request a new code.";
            INVALID_TWO_FACTOR_COOKIE: "Invalid two factor cookie";
            SUBSCRIPTION_NOT_FOUND: "Subscription not found";
            SUBSCRIPTION_PLAN_NOT_FOUND: "Subscription plan not found";
            ALREADY_SUBSCRIBED_PLAN: "You're already subscribed to this plan";
            UNABLE_TO_CREATE_CUSTOMER: "Unable to create customer";
            FAILED_TO_FETCH_PLANS: "Failed to fetch plans";
            EMAIL_VERIFICATION_REQUIRED: "Email verification is required before you can subscribe to a plan";
            SUBSCRIPTION_NOT_ACTIVE: "Subscription is not active";
            SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION: "Subscription is not scheduled for cancellation";
            INVALID_PHONE_NUMBER: "Invalid phone number";
            PHONE_NUMBER_EXIST: "Phone number already exists";
            INVALID_PHONE_NUMBER_OR_PASSWORD: "Invalid phone number or password";
            OTP_NOT_FOUND: "OTP not found";
            OTP_EXPIRED: "OTP expired";
            INVALID_OTP: "Invalid OTP";
            PHONE_NUMBER_NOT_VERIFIED: "Phone number not verified";
            CHALLENGE_NOT_FOUND: "Challenge not found";
            YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: "You are not allowed to register this passkey";
            FAILED_TO_VERIFY_REGISTRATION: "Failed to verify registration";
            PASSKEY_NOT_FOUND: "Passkey not found";
            AUTHENTICATION_FAILED: "Authentication failed";
            UNABLE_TO_CREATE_SESSION: "Unable to create session";
            FAILED_TO_UPDATE_PASSKEY: "Failed to update passkey";
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: "You are not allowed to create a new organization";
            YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: "You have reached the maximum number of organizations";
            ORGANIZATION_ALREADY_EXISTS: "Organization already exists";
            ORGANIZATION_NOT_FOUND: "Organization not found";
            USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: "User is not a member of the organization";
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: "You are not allowed to update this organization";
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: "You are not allowed to delete this organization";
            NO_ACTIVE_ORGANIZATION: "No active organization";
            USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "User is already a member of this organization";
            MEMBER_NOT_FOUND: "Member not found";
            ROLE_NOT_FOUND: "Role not found";
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: "You are not allowed to create a new team";
            TEAM_ALREADY_EXISTS: "Team already exists";
            TEAM_NOT_FOUND: "Team not found";
            YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: "You cannot leave the organization as the only owner";
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "You are not allowed to delete this member";
            YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: "You are not allowed to invite users to this organization";
            USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "User is already invited to this organization";
            INVITATION_NOT_FOUND: "Invitation not found";
            YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: "You are not the recipient of the invitation";
            YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "You are not allowed to cancel this invitation";
            INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: "Inviter is no longer a member of the organization";
            YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: "you are not allowed to invite user with this role";
            FAILED_TO_RETRIEVE_INVITATION: "Failed to retrieve invitation";
            YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: "You have reached the maximum number of teams";
            UNABLE_TO_REMOVE_LAST_TEAM: "Unable to remove last team";
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "You are not allowed to update this member";
            ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "Organization membership limit reached";
            YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to create teams in this organization";
            YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to delete teams in this organization";
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: "You are not allowed to update this team";
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: "You are not allowed to delete this team";
            INVITATION_LIMIT_REACHED: "Invitation limit reached";
            INVALID_SESSION_TOKEN: "Invalid session token";
            PASSWORD_COMPROMISED: "The password you entered has been compromised. Please choose a different password.";
            INVALID_OAUTH_CONFIGURATION: "Invalid OAuth configuration";
            INVALID_EMAIL: "Invalid email";
            USER_NOT_FOUND: "User not found";
            TOO_MANY_ATTEMPTS: "Too many attempts";
            MISSING_SECRET_KEY: string;
            SERVICE_UNAVAILABLE: string;
            VERIFICATION_FAILED: string;
            MISSING_RESPONSE: string;
            UNKNOWN_ERROR: string;
            INVALID_METADATA_TYPE: string;
            REFILL_AMOUNT_AND_INTERVAL_REQUIRED: string;
            REFILL_INTERVAL_AND_AMOUNT_REQUIRED: string;
            USER_BANNED: string;
            UNAUTHORIZED_SESSION: string;
            KEY_NOT_FOUND: string;
            KEY_DISABLED: string;
            KEY_EXPIRED: string;
            USAGE_EXCEEDED: string;
            KEY_NOT_RECOVERABLE: string;
            EXPIRES_IN_IS_TOO_SMALL: string;
            EXPIRES_IN_IS_TOO_LARGE: string;
            INVALID_REMAINING: string;
            INVALID_PREFIX_LENGTH: string;
            INVALID_NAME_LENGTH: string;
            METADATA_DISABLED: string;
            RATE_LIMIT_EXCEEDED: string;
            NO_VALUES_TO_UPDATE: string;
            KEY_DISABLED_EXPIRATION: string;
            INVALID_API_KEY: string;
            INVALID_USER_ID_FROM_API_KEY: string;
            INVALID_API_KEY_GETTER_RETURN_TYPE: string;
            SERVER_ONLY_PROPERTY: string;
            FAILED_TO_CREATE_USER: "Failed to create user";
            COULD_NOT_CREATE_SESSION: "Could not create session";
            ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY: "Anonymous users cannot sign in again anonymously";
            USER_ALREADY_EXISTS: "User already exists";
            YOU_CANNOT_BAN_YOURSELF: "You cannot ban yourself";
            YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "You are not allowed to change users role";
            YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: "You are not allowed to create users";
            YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "You are not allowed to list users";
            YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: "You are not allowed to list users sessions";
            YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "You are not allowed to ban users";
            YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: "You are not allowed to impersonate users";
            YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: "You are not allowed to revoke users sessions";
            YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "You are not allowed to delete users";
            YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: "You are not allowed to set users password";
            BANNED_USER: "You have been banned from this application";
            FAILED_TO_CREATE_SESSION: "Failed to create session";
            FAILED_TO_UPDATE_USER: "Failed to update user";
            FAILED_TO_GET_SESSION: "Failed to get session";
            INVALID_PASSWORD: "Invalid password";
            INVALID_EMAIL_OR_PASSWORD: "Invalid email or password";
            SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked";
            PROVIDER_NOT_FOUND: "Provider not found";
            INVALID_TOKEN: "Invalid token";
            ID_TOKEN_NOT_SUPPORTED: "id_token not supported";
            FAILED_TO_GET_USER_INFO: "Failed to get user info";
            USER_EMAIL_NOT_FOUND: "User email not found";
            PASSWORD_TOO_SHORT: "Password too short";
            PASSWORD_TOO_LONG: "Password too long";
            EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated";
            CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found";
            SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.";
            FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account";
            ACCOUNT_NOT_FOUND: "Account not found";
            USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account.";
            /** @default "Account" */
            ACCOUNT: string;
            /** @default "Accounts" */
            ACCOUNTS: string;
            /** @default "Manage your currently signed in accounts." */
            ACCOUNTS_DESCRIPTION: string;
            /** @default "Sign in to an additional account." */
            ACCOUNTS_INSTRUCTIONS: string;
            /** @default "Add Account" */
            ADD_ACCOUNT: string;
            /** @default "Add Passkey" */
            ADD_PASSKEY: string;
            /** @default "Already have an account?" */
            ALREADY_HAVE_AN_ACCOUNT: string;
            /** @default "Avatar" */
            AVATAR: string;
            /** @default "Click on the avatar to upload a custom one from your files." */
            AVATAR_DESCRIPTION: string;
            /** @default "An avatar is optional but strongly recommended." */
            AVATAR_INSTRUCTIONS: string;
            /** @default "Backup code is required" */
            BACKUP_CODE_REQUIRED: string;
            /** @default "Backup Codes" */
            BACKUP_CODES: string;
            /** @default "Save these backup codes in a secure place. You can use them to access your account if you lose your two-factor authentication method." */
            BACKUP_CODES_DESCRIPTION: string;
            /** @default "Backup Code." */
            BACKUP_CODE_PLACEHOLDER: string;
            /** @default "Backup Code" */
            BACKUP_CODE: string;
            /** @default "Cancel" */
            CANCEL: string;
            /** @default "Change Password" */
            CHANGE_PASSWORD: string;
            /** @default "Enter your current password and a new password." */
            CHANGE_PASSWORD_DESCRIPTION: string;
            /** @default "Please use 8 characters at minimum." */
            CHANGE_PASSWORD_INSTRUCTIONS: string;
            /** @default "Your password has been changed." */
            CHANGE_PASSWORD_SUCCESS: string;
            /** @default "Confirm Password" */
            CONFIRM_PASSWORD: string;
            /** @default "Confirm Password" */
            CONFIRM_PASSWORD_PLACEHOLDER: string;
            /** @default "Confirm password is required" */
            CONFIRM_PASSWORD_REQUIRED: string;
            /** @default "Continue with Authenticator" */
            CONTINUE_WITH_AUTHENTICATOR: string;
            /** @default "Copied to clipboard" */
            COPIED_TO_CLIPBOARD: string;
            /** @default "Copy to clipboard" */
            COPY_TO_CLIPBOARD: string;
            /** @default "Copy all codes" */
            COPY_ALL_CODES: string;
            /** @default "Continue" */
            CONTINUE: string;
            /** @default "Current Password" */
            CURRENT_PASSWORD: string;
            /** @default "Current Password" */
            CURRENT_PASSWORD_PLACEHOLDER: string;
            /** @default "Current Session" */
            CURRENT_SESSION: string;
            /** @default "Delete" */
            DELETE: string;
            /** @default "Delete Avatar" */
            DELETE_AVATAR: string;
            /** @default "Delete Account" */
            DELETE_ACCOUNT: string;
            /** @default "Permanently remove your account and all of its contents. This action is not reversible, so please continue with caution." */
            DELETE_ACCOUNT_DESCRIPTION: string;
            /** @default "Please confirm the deletion of your account. This action is not reversible, so please continue with caution." */
            DELETE_ACCOUNT_INSTRUCTIONS: string;
            /** @default "Please check your email to verify the deletion of your account." */
            DELETE_ACCOUNT_VERIFY: string;
            /** @default "Your account has been deleted." */
            DELETE_ACCOUNT_SUCCESS: string;
            /** @default "Disable Two-Factor" */
            DISABLE_TWO_FACTOR: string;
            /** @default "Choose a provider to login to your account" */
            DISABLED_CREDENTIALS_DESCRIPTION: string;
            /** @default "Don't have an account?" */
            DONT_HAVE_AN_ACCOUNT: string;
            /** @default "Done" */
            DONE: string;
            /** @default "Email" */
            EMAIL: string;
            /** @default "Enter the email address you want to use to log in." */
            EMAIL_DESCRIPTION: string;
            /** @default "Please enter a valid email address." */
            EMAIL_INSTRUCTIONS: string;
            /** @default "Email is the same" */
            EMAIL_IS_THE_SAME: string;
            /** @default "m@example.com" */
            EMAIL_PLACEHOLDER: string;
            /** @default "Email address is required" */
            EMAIL_REQUIRED: string;
            /** @default "Please check your email to verify the change." */
            EMAIL_VERIFY_CHANGE: string;
            /** @default "Please check your email for the verification link." */
            EMAIL_VERIFICATION: string;
            /** @default "Enable Two-Factor" */
            ENABLE_TWO_FACTOR: string;
            /** @default "is invalid" */
            IS_INVALID: string;
            /** @default "is required" */
            IS_REQUIRED: string;
            /** @default "is the same" */
            IS_THE_SAME: string;
            /** @default "Forgot authenticator?" */
            FORGOT_AUTHENTICATOR: string;
            /** @default "Forgot Password" */
            FORGOT_PASSWORD: string;
            /** @default "Send reset link" */
            FORGOT_PASSWORD_ACTION: string;
            /** @default "Enter your email to reset your password" */
            FORGOT_PASSWORD_DESCRIPTION: string;
            /** @default "Check your email for the password reset link." */
            FORGOT_PASSWORD_EMAIL: string;
            /** @default "Forgot your password?" */
            FORGOT_PASSWORD_LINK: string;
            /** @default "Link" */
            LINK: string;
            /** @default "Magic Link" */
            MAGIC_LINK: string;
            /** @default "Send magic link" */
            MAGIC_LINK_ACTION: string;
            /** @default "Enter your email to receive a magic link" */
            MAGIC_LINK_DESCRIPTION: string;
            /** @default "Check your email for the magic link" */
            MAGIC_LINK_EMAIL: string;
            /** @default "Email Code" */
            EMAIL_OTP: string;
            /** @default "Send code" */
            EMAIL_OTP_SEND_ACTION: string;
            /** @default "Verify code" */
            EMAIL_OTP_VERIFY_ACTION: string;
            /** @default "Enter your email to receive a code" */
            EMAIL_OTP_DESCRIPTION: string;
            /** @default "Please check your email for the verification code." */
            EMAIL_OTP_VERIFICATION_SENT: string;
            /** @default "Name" */
            NAME: string;
            /** @default "Please enter your full name, or a display name." */
            NAME_DESCRIPTION: string;
            /** @default "Please use 32 characters at maximum." */
            NAME_INSTRUCTIONS: string;
            /** @default "Name" */
            NAME_PLACEHOLDER: string;
            /** @default "New Password" */
            NEW_PASSWORD: string;
            /** @default "New Password" */
            NEW_PASSWORD_PLACEHOLDER: string;
            /** @default "New password is required" */
            NEW_PASSWORD_REQUIRED: string;
            /** @default "One-Time Password" */
            ONE_TIME_PASSWORD: string;
            /** @default "Or continue with" */
            OR_CONTINUE_WITH: string;
            /** @default "Passkey" */
            PASSKEY: string;
            /** @default "Passkeys" */
            PASSKEYS: string;
            /** @default "Manage your passkeys for secure access." */
            PASSKEYS_DESCRIPTION: string;
            /** @default "Securely access your account without a password." */
            PASSKEYS_INSTRUCTIONS: string;
            /** @default "Personal Account" */
            PERSONAL_ACCOUNT: string;
            /** @default "API Keys" */
            API_KEYS: string;
            /** @default "Manage your API keys for secure access." */
            API_KEYS_DESCRIPTION: string;
            /** @default "Generate API keys to access your account programmatically." */
            API_KEYS_INSTRUCTIONS: string;
            /** @default "Create API Key" */
            CREATE_API_KEY: string;
            /** @default "Enter a unique name for your API key to differentiate it from other keys." */
            CREATE_API_KEY_DESCRIPTION: string;
            /** @default "New API Key" */
            API_KEY_NAME_PLACEHOLDER: string;
            /** @default "API Key Created" */
            API_KEY_CREATED: string;
            /** @default "Please copy your API key and store it in a safe place. For security reasons we cannot show it again." */
            CREATE_API_KEY_SUCCESS: string;
            /** @default "Never Expires" */
            NEVER_EXPIRES: string;
            /** @default "Expires" */
            EXPIRES: string;
            /** @default "No Expiration" */
            NO_EXPIRATION: string;
            /** @default "Create Organization" */
            CREATE_ORGANIZATION: string;
            /** @default "Organization" */
            ORGANIZATION: string;
            /** @default "Name" */
            ORGANIZATION_NAME: string;
            /** @default "Acme Inc." */
            ORGANIZATION_NAME_PLACEHOLDER: string;
            /** @default "This is your organization's visible name." */
            ORGANIZATION_NAME_DESCRIPTION: string;
            /** @default "Please use 32 characters at maximum." */
            ORGANIZATION_NAME_INSTRUCTIONS: string;
            /** @default "Slug URL" */
            ORGANIZATION_SLUG: string;
            /** @default "This is your organization's URL namespace." */
            ORGANIZATION_SLUG_DESCRIPTION: string;
            /** @default "Please use 48 characters at maximum." */
            ORGANIZATION_SLUG_INSTRUCTIONS: string;
            /** @default "acme-inc" */
            ORGANIZATION_SLUG_PLACEHOLDER: string;
            /** @default "Organization created successfully" */
            CREATE_ORGANIZATION_SUCCESS: string;
            /** @default "Password" */
            PASSWORD: string;
            /** @default "Password" */
            PASSWORD_PLACEHOLDER: string;
            /** @default "Password is required" */
            PASSWORD_REQUIRED: string;
            /** @default "Passwords do not match" */
            PASSWORDS_DO_NOT_MATCH: string;
            /** @default "Providers" */
            PROVIDERS: string;
            /** @default "Connect your account with a third-party service." */
            PROVIDERS_DESCRIPTION: string;
            /** @default "Recover Account" */
            RECOVER_ACCOUNT: string;
            /** @default "Recover account" */
            RECOVER_ACCOUNT_ACTION: string;
            /** @default "Please enter a backup code to access your account" */
            RECOVER_ACCOUNT_DESCRIPTION: string;
            /** @default "Remember me" */
            REMEMBER_ME: string;
            /** @default "Resend code" */
            RESEND_CODE: string;
            /** @default "Resend verification email" */
            RESEND_VERIFICATION_EMAIL: string;
            /** @default "Reset Password" */
            RESET_PASSWORD: string;
            /** @default "Save new password" */
            RESET_PASSWORD_ACTION: string;
            /** @default "Enter your new password below" */
            RESET_PASSWORD_DESCRIPTION: string;
            /** @default "Password reset successfully" */
            RESET_PASSWORD_SUCCESS: string;
            /** @default "Request failed" */
            REQUEST_FAILED: string;
            /** @default "Revoke" */
            REVOKE: string;
            /** @default "Delete API Key" */
            DELETE_API_KEY: string;
            /** @default "Are you sure you want to delete this API key?" */
            DELETE_API_KEY_CONFIRM: string;
            /** @default "API Key" */
            API_KEY: string;
            /** @default "Sign In" */
            SIGN_IN: string;
            /** @default "Login" */
            SIGN_IN_ACTION: string;
            /** @default "Enter your email below to login to your account" */
            SIGN_IN_DESCRIPTION: string;
            /** @default "Enter your username or email below to login to your account" */
            SIGN_IN_USERNAME_DESCRIPTION: string;
            /** @default "Sign in with" */
            SIGN_IN_WITH: string;
            /** @default "Sign Out" */
            SIGN_OUT: string;
            /** @default "Sign Up" */
            SIGN_UP: string;
            /** @default "Create an account" */
            SIGN_UP_ACTION: string;
            /** @default "Enter your information to create an account" */
            SIGN_UP_DESCRIPTION: string;
            /** @default "Check your email for the verification link." */
            SIGN_UP_EMAIL: string;
            /** @default "Sessions" */
            SESSIONS: string;
            /** @default "Manage your active sessions and revoke access." */
            SESSIONS_DESCRIPTION: string;
            /** @default "Set Password" */
            SET_PASSWORD: string;
            /** @default "Click the button below to receive an email to set up a password for your account." */
            SET_PASSWORD_DESCRIPTION: string;
            /** @default "Settings" */
            SETTINGS: string;
            /** @default "Save" */
            SAVE: string;
            /** @default "Security" */
            SECURITY: string;
            /** @default "Switch Account" */
            SWITCH_ACCOUNT: string;
            /** @default "Trust this device" */
            TRUST_DEVICE: string;
            /** @default "Two-Factor" */
            TWO_FACTOR: string;
            /** @default "Verify code" */
            TWO_FACTOR_ACTION: string;
            /** @default "Please enter your one-time password to continue" */
            TWO_FACTOR_DESCRIPTION: string;
            /** @default "Add an extra layer of security to your account." */
            TWO_FACTOR_CARD_DESCRIPTION: string;
            /** @default "Please enter your password to disable 2FA." */
            TWO_FACTOR_DISABLE_INSTRUCTIONS: string;
            /** @default "Please enter your password to enable 2FA" */
            TWO_FACTOR_ENABLE_INSTRUCTIONS: string;
            /** @default "Two-factor authentication has been enabled" */
            TWO_FACTOR_ENABLED: string;
            /** @default "Two-Factor Authentication has been disabled" */
            TWO_FACTOR_DISABLED: string;
            /** @default "Two-Factor Authentication" */
            TWO_FACTOR_PROMPT: string;
            /** @default "Scan the QR Code with your Authenticator" */
            TWO_FACTOR_TOTP_LABEL: string;
            /** @default "Send verification code" */
            SEND_VERIFICATION_CODE: string;
            /** @default "Unlink" */
            UNLINK: string;
            /** @default "Updated successfully" */
            UPDATED_SUCCESSFULLY: string;
            /** @default "Username" */
            USERNAME: string;
            /** @default "Enter the username you want to use to log in." */
            USERNAME_DESCRIPTION: string;
            /** @default "Please use 32 characters at maximum." */
            USERNAME_INSTRUCTIONS: string;
            /** @default "Username" */
            USERNAME_PLACEHOLDER: string;
            /** @default "Username or email" */
            SIGN_IN_USERNAME_PLACEHOLDER: string;
            /** @default "Verify Your Email" */
            VERIFY_YOUR_EMAIL: string;
            /** @default "Please verify your email address. Check your inbox for the verification email. If you haven't received the email, click the button below to resend." */
            VERIFY_YOUR_EMAIL_DESCRIPTION: string;
            /** @default "Go back" */
            GO_BACK: string;
            /** @default "Your session is not fresh. Please sign in again." */
            SESSION_NOT_FRESH: string;
            /** @default "Upload Avatar" */
            UPLOAD_AVATAR: string;
            /** @default "Logo" */
            LOGO: string;
            /** @default "Click on the logo to upload a custom one from your files." */
            LOGO_DESCRIPTION: string;
            /** @default "A logo is optional but strongly recommended." */
            LOGO_INSTRUCTIONS: string;
            /** @default "Upload" */
            UPLOAD: string;
            /** @default "Upload Logo" */
            UPLOAD_LOGO: string;
            /** @default "Delete Logo" */
            DELETE_LOGO: string;
            /** @default "Privacy Policy" */
            PRIVACY_POLICY: string;
            /** @default "Terms of Service" */
            TERMS_OF_SERVICE: string;
            /** @default "This site is protected by reCAPTCHA." */
            PROTECTED_BY_RECAPTCHA: string;
            /** @default "By continuing, you agree to the" */
            BY_CONTINUING_YOU_AGREE: string;
            /** @default "User" */
            USER: string;
            /** @default "Organizations" */
            ORGANIZATIONS: string;
            /** @default "Manage your organizations and memberships." */
            ORGANIZATIONS_DESCRIPTION: string;
            /** @default "Create an organization to collaborate with other users." */
            ORGANIZATIONS_INSTRUCTIONS: string;
            /** @default "Leave Organization" */
            LEAVE_ORGANIZATION: string;
            /** @default "Are you sure you want to leave this organization?" */
            LEAVE_ORGANIZATION_CONFIRM: string;
            /** @default "You have successfully left the organization." */
            LEAVE_ORGANIZATION_SUCCESS: string;
            /** @default "Manage Organization" */
            MANAGE_ORGANIZATION: string;
            /** @default "Remove Member" */
            REMOVE_MEMBER: string;
            /** @default "Are you sure you want to remove this member from the organization?" */
            REMOVE_MEMBER_CONFIRM: string;
            /** @default "Member removed successfully" */
            REMOVE_MEMBER_SUCCESS: string;
            /** @default "Invite Member" */
            INVITE_MEMBER: string;
            /** @default "Members" */
            MEMBERS: string;
            /** @default "Add or remove members and manage their roles." */
            MEMBERS_DESCRIPTION: string;
            /** @default "Invite new members to your organization." */
            MEMBERS_INSTRUCTIONS: string;
            /** @default "Send an invitation to add a new member to your organization." */
            INVITE_MEMBER_DESCRIPTION: string;
            /** @default "Role" */
            ROLE: string;
            /** @default "Select a role" */
            SELECT_ROLE: string;
            /** @default "Admin" */
            ADMIN: string;
            /** @default "Member" */
            MEMBER: string;
            /** @default "Guest" */
            GUEST: string;
            /** @default "Owner" */
            OWNER: string;
            /** @default "Update the role for this member" */
            UPDATE_ROLE_DESCRIPTION: string;
            /** @default "Update Role" */
            UPDATE_ROLE: string;
            /** @default "Member role updated successfully" */
            MEMBER_ROLE_UPDATED: string;
            /** @default "Send Invitation" */
            SEND_INVITATION: string;
            /** @default "Invitation sent successfully" */
            SEND_INVITATION_SUCCESS: string;
            /** @default "Pending Invitations" */
            PENDING_INVITATIONS: string;
            /** @default "Manage pending invitations to your organization." */
            PENDING_INVITATIONS_DESCRIPTION: string;
            /** @default "Cancel Invitation" */
            CANCEL_INVITATION: string;
            /** @default "Invitation cancelled successfully" */
            INVITATION_CANCELLED: string;
            /** @default "Accept Invitation" */
            ACCEPT_INVITATION: string;
            /** @default "You have been invited to join an organization." */
            ACCEPT_INVITATION_DESCRIPTION: string;
            /** @default "Invitation accepted successfully" */
            INVITATION_ACCEPTED: string;
            /** @default "Invitation rejected successfully" */
            INVITATION_REJECTED: string;
            /** @default "Accept" */
            ACCEPT: string;
            /** @default "Reject" */
            REJECT: string;
            /** @default "This invitation has expired" */
            INVITATION_EXPIRED: string;
            /** @default "Delete Organization" */
            DELETE_ORGANIZATION: string;
            /** @default "Permanently remove your organization and all of its contents. This action is not reversible — please continue with caution." */
            DELETE_ORGANIZATION_DESCRIPTION: string;
            /** @default "Organization deleted successfully" */
            DELETE_ORGANIZATION_SUCCESS: string;
            /** @default "Enter the organization slug to continue:" */
            DELETE_ORGANIZATION_INSTRUCTIONS: string;
            /** @default "Organization slug is required" */
            SLUG_REQUIRED: string;
            /** @default "The slug does not match" */
            SLUG_DOES_NOT_MATCH: string;
        }
        }}
      >
        <div className="AuthProvider">{children}</div>
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
};
