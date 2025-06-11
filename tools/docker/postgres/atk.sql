CREATE TYPE "public"."currency" AS ENUM('EUR', 'USD', 'GBP', 'CHF', 'JPY', 'AED', 'SGD', 'SAR');
CREATE TABLE "regulation_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"regulation_type" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "mica_regulation_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"regulation_config_id" text NOT NULL,
	"documents" jsonb,
	"reserve_composition" jsonb,
	"last_audit_date" timestamp with time zone,
	"reserve_status" text,
	"token_type" text,
	"licence_number" text,
	"regulatory_authority" text,
	"approval_date" timestamp with time zone,
	"approval-details" text,
	CONSTRAINT "mica_regulation_configs_regulation_config_id_unique" UNIQUE("regulation_config_id")
);

CREATE TABLE "airdrop_distribution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airdrop_id" text NOT NULL,
	"recipient" text NOT NULL,
	"amount" text NOT NULL,
	"index" integer NOT NULL,
	"claimed" timestamp with time zone,
	CONSTRAINT "airdrop_distribution_unique_constraint" UNIQUE("airdrop_id","recipient")
);

CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"isin" text,
	"internalid" text
);

CREATE TABLE "asset_price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" text NOT NULL,
	"amount" numeric(36, 18),
	"currency" "currency" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"wallet" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);

CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean,
	"rate_limit_enabled" boolean,
	"rate_limit_time_window" integer,
	"rate_limit_max" integer,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"permissions" text,
	"metadata" text
);

CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_i_d" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp with time zone
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL
);

CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"wallet" text,
	"kyc_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"pincode_enabled" boolean DEFAULT false NOT NULL,
	"pincode_verification_id" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_verification_id" text,
	"secret_code_verification_id" text,
	"initial_onboarding_finished" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_wallet_unique" UNIQUE("wallet")
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);

CREATE TABLE "exchange_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"base_currency" text NOT NULL,
	"quote_currency" text NOT NULL,
	"rate" numeric NOT NULL,
	"day" date NOT NULL
);

CREATE TABLE "redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"processed_date" timestamp with time zone
);

CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "mica_regulation_configs" ADD CONSTRAINT "mica_regulation_configs_regulation_config_id_regulation_configs_id_fk" FOREIGN KEY ("regulation_config_id") REFERENCES "public"."regulation_configs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "asset_price" ADD CONSTRAINT "asset_price_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contact" ADD CONSTRAINT "contact_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "airdrop_distribution_recipient_idx" ON "airdrop_distribution" USING btree ("recipient");
CREATE INDEX "airdrop_distribution_airdrop_id_idx" ON "airdrop_distribution" USING btree ("airdrop_id");
CREATE INDEX "airdrop_distribution_recipient_airdrop_idx" ON "airdrop_distribution" USING btree ("recipient","airdrop_id");
CREATE INDEX "asset_isin_idx" ON "asset" USING btree ("isin");
CREATE INDEX "asset_internalid_idx" ON "asset" USING btree ("internalid");
CREATE INDEX "asset_price_asset_id_idx" ON "asset_price" USING btree ("asset_id");
CREATE INDEX "contact_name_idx" ON "contact" USING btree ("name");
CREATE INDEX "contact_wallet_idx" ON "contact" USING btree ("wallet");
CREATE INDEX "contact_user_id_idx" ON "contact" USING btree ("user_id");
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");
CREATE INDEX "account_provider_id_idx" ON "account" USING btree ("provider_id");
CREATE INDEX "account_account_id_idx" ON "account" USING btree ("account_id");
CREATE INDEX "apikey_user_id_idx" ON "apikey" USING btree ("user_id");
CREATE INDEX "apikey_enabled_idx" ON "apikey" USING btree ("enabled");
CREATE INDEX "apikey_expires_at_idx" ON "apikey" USING btree ("expires_at");
CREATE INDEX "passkey_user_id_idx" ON "passkey" USING btree ("user_id");
CREATE INDEX "passkey_credential_id_idx" ON "passkey" USING btree ("credential_i_d");
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");
CREATE INDEX "two_factor_user_id_idx" ON "two_factor" USING btree ("user_id");
CREATE INDEX "user_wallet_idx" ON "user" USING btree ("wallet");
CREATE INDEX "user_currency_idx" ON "user" USING btree ("currency");
CREATE INDEX "user_email_verified_idx" ON "user" USING btree ("email_verified");
CREATE INDEX "user_banned_idx" ON "user" USING btree ("banned");
CREATE INDEX "user_kyc_verified_at_idx" ON "user" USING btree ("kyc_verified_at");
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");
CREATE INDEX "exchange_rate_base_currency_idx" ON "exchange_rate" USING btree ("base_currency");
CREATE INDEX "exchange_rate_quote_currency_idx" ON "exchange_rate" USING btree ("quote_currency");
CREATE INDEX "exchange_rate_day_idx" ON "exchange_rate" USING btree ("day");
CREATE INDEX "redemptions_processedDate_idx" ON "redemptions" USING btree ("processed_date");
