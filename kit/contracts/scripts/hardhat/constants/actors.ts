import { Actor } from "../entities/actor";
import { Countries } from "./countries";

export const owner = new Actor("Owner", Countries.BE, 0);
export const investorA = new Actor("Investor A", Countries.BE, 1);
export const investorANew = new Actor("Investor A New", Countries.BE, 2);
export const investorB = new Actor("Investor B", Countries.NL, 3);
export const frozenInvestor = new Actor("Frozen Investor", Countries.NL, 4);
export const maliciousInvestor = new Actor(
  "Malicious Investor",
  Countries.ES,
  5
);
export const claimIssuer = new Actor("Claim Issuer", Countries.BE, 6);
