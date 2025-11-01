CREATE TABLE IF NOT EXISTS "contact" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "wallet" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contact_name_idx" ON "contact" ("name");
CREATE INDEX IF NOT EXISTS "contact_wallet_idx" ON "contact" ("wallet");
CREATE INDEX IF NOT EXISTS "contact_user_id_idx" ON "contact" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "contact_user_wallet_unique" ON "contact" ("user_id", "wallet");
