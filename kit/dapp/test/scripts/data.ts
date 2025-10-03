import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  User,
} from "@test/fixtures/user";
import { from } from "dnum";

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

export const DE_COUNTRY_CODE = "276";
export const JP_COUNTRY_CODE = "392";

export const BONDS = [
  {
    name: "Bund7",
    symbol: "BUND7",
    isin: "DE000BU27014",
    yieldRate: 250,
    cap: from(8_000_000_000, 18),
    issueDate: new Date(2026, 8, 24),
    maturityDate: new Date(2027, 8, 24),
    countries: [DE_COUNTRY_CODE],
  },
  {
    name: "Bund10",
    symbol: "BUND10",
    isin: "DE000BU2Z056",
    yieldRate: 260,
    cap: from(26_000_000_000, 18),
    issueDate: new Date(2026, 8, 24),
    maturityDate: new Date(2027, 8, 24),
    countries: [DE_COUNTRY_CODE, JP_COUNTRY_CODE],
  },
];
