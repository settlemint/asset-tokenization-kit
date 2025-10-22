import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  User,
} from "@test/fixtures/user";

export const ADMIN: User = {
  ...DEFAULT_ADMIN,
  firstName: "System",
  lastName: "Admin",
};

export const ISSUER: User = {
  ...DEFAULT_ISSUER,
  firstName: "Asset",
  lastName: "Issuer",
};

export const GERMAN_INVESTOR_1: User = {
  ...DEFAULT_INVESTOR,
  email: "german.investor1@settlemint.com",
  firstName: "German",
  lastName: "Investor 1",
};

export const GERMAN_INVESTOR_2: User = {
  ...DEFAULT_INVESTOR,
  email: "german.investor2@settlemint.com",
  firstName: "German",
  lastName: "Investor 2",
};

export const JAPANESE_INVESTOR: User = {
  ...DEFAULT_INVESTOR,
  email: "japanese.investor@settlemint.com",
  firstName: "Japanese",
  lastName: "Investor",
};

export const US_INVESTOR: User = {
  ...DEFAULT_INVESTOR,
  email: "us.investor@settlemint.com",
  firstName: "US",
  lastName: "Investor",
};
