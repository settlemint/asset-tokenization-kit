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
--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp with time zone,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 60000,
	"rate_limit_max" integer DEFAULT 60,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
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
	"created_at" timestamp with time zone,
	"aaguid" text
);
--> statement-breakpoint
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
--> statement-breakpoint
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
	"last_login_at" timestamp with time zone,
	"pincode_enabled" boolean DEFAULT false NOT NULL,
	"pincode_verification_id" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_verification_id" text,
	"secret_code_verification_id" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_wallet_unique" UNIQUE("wallet"),
	CONSTRAINT "user_pincode_verification_id_unique" UNIQUE("pincode_verification_id"),
	CONSTRAINT "user_two_factor_verification_id_unique" UNIQUE("two_factor_verification_id"),
	CONSTRAINT "user_secret_code_verification_id_unique" UNIQUE("secret_code_verification_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"decimals" numeric(2, 0) DEFAULT '2'
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"base_code" varchar(3) NOT NULL,
	"quote_code" varchar(3) NOT NULL,
	"provider" varchar(32) NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"rate" numeric(38, 18) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fx_rates_base_code_quote_code_provider_effective_at_pk" PRIMARY KEY("base_code","quote_code","provider","effective_at")
);
--> statement-breakpoint
CREATE TABLE "fx_rates_latest" (
	"base_code" varchar(3) NOT NULL,
	"quote_code" varchar(3) NOT NULL,
	"provider" varchar(32) NOT NULL,
	"rate" numeric(38, 18) NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fx_rates_latest_base_code_quote_code_provider_pk" PRIMARY KEY("base_code","quote_code","provider")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates" ADD CONSTRAINT "fx_rates_base_code_currencies_code_fk" FOREIGN KEY ("base_code") REFERENCES "public"."currencies"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates" ADD CONSTRAINT "fx_rates_quote_code_currencies_code_fk" FOREIGN KEY ("quote_code") REFERENCES "public"."currencies"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates_latest" ADD CONSTRAINT "fx_rates_latest_base_code_currencies_code_fk" FOREIGN KEY ("base_code") REFERENCES "public"."currencies"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates_latest" ADD CONSTRAINT "fx_rates_latest_quote_code_currencies_code_fk" FOREIGN KEY ("quote_code") REFERENCES "public"."currencies"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fx_rates_quote_base_ts" ON "fx_rates" USING btree ("quote_code","base_code","effective_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_fx_rates_base_quote_ts" ON "fx_rates" USING btree ("base_code","quote_code","effective_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_fx_rates_provider_ts" ON "fx_rates" USING btree ("provider","effective_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_fx_latest_quote_base" ON "fx_rates_latest" USING btree ("quote_code","base_code");--> statement-breakpoint
CREATE INDEX "idx_fx_latest_provider" ON "fx_rates_latest" USING btree ("provider");