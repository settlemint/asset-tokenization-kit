import { z } from "zod";

export const entityTypes = ["token", "vault", "contract", "wallet"] as const;

export const EntityTypeSchema = z.enum(entityTypes);

export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EntityTypeLabels: Record<EntityType, string> = {
  token: "Token",
  vault: "Vault",
  contract: "Contract",
  wallet: "Wallet",
};
