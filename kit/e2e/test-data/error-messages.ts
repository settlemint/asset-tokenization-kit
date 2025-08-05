export const errorMessages = {
  validation: {
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    emailInvalid: "Email is invalid",
  },
  authentication: {
    invalidCredentials: "The email or password you entered is invalid.",
  },
  signUp: {
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    confirmPasswordRequired: "Confirm Password is required",
    passwordsDoNotMatch: "Passwords do not match",
    emailInvalid: "Email is invalid",
    passwordTooShort: "Password must be at least 8 characters",
    emailAlreadyExists: "An account with this email already exists",
  },
  general: {
    networkError: "Network error occurred",
    unexpectedError: "An unexpected error occurred",
  },
} as const;

export type ErrorMessages = typeof errorMessages;
