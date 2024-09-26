CREATE TABLE "public"."wallets" ("email" text NOT NULL, "wallet" text NOT NULL, "role" text[], PRIMARY KEY ("email") , UNIQUE ("wallet"));
