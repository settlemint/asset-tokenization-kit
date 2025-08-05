export const validationTestData = {
  invalidEmails: [
    "not-an-email",
    "invalid-email",
    "missing@domain",
    "@missing-local.com",
    "spaces in@email.com",
    "double..dots@email.com",
    "email@",
    ".email@domain.com",
    "email@domain.",
    "email@.domain.com",
  ],
  nonExistentEmails: [
    "nonexistent@settlemint.com",
    "fake@settlemint.com",
    "notreal@settlemint.com",
  ],
  emptyFields: {
    email: "",
    password: "",
  },
} as const;

export type ValidationTestData = typeof validationTestData;
