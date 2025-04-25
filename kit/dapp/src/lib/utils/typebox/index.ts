import { t as tElysia } from "elysia/type-system";

import type { StaticDecode, TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { redactSensitiveFields } from "../redaction";
import { EthereumAddress } from "./address";
import { Amount } from "./amount";
import { AssetSymbol } from "./asset-symbol";
import { AssetType } from "./asset-types";
import { BigDecimal } from "./bigdecimal";
import { StringifiedBigInt } from "./bigint";
import { Decimals } from "./decimals";
import { EquityCategory } from "./equity-categories";
import { EquityClass } from "./equity-classes";
import { FiatCurrency } from "./fiat-currency";
import { FundCategory } from "./fund-categories";
import { FundClass } from "./fund-classes";
import { Hash, Hashes } from "./hash";
import { Isin } from "./isin";
import { Pincode } from "./pincode";
import { Price } from "./price";
import { RoleMap, Roles } from "./roles";
import { SecretCode } from "./secret-code";
import { TimeUnit } from "./time-units";
import { Timestamp } from "./timestamp";
import { TwoFactorCode } from "./two-factor-code";
import { UserRoles } from "./user-roles";
import { VerificationCode } from "./verification-code";
import { VerificationType } from "./verification-type";

// Cache for compiled schemas
const compiledSchemaCache = new Map<
  TSchema,
  ReturnType<typeof TypeCompiler.Compile>
>();

// Extend TypeBox types with module augmentation
declare module "@sinclair/typebox" {
  interface JavaScriptTypeBuilder {
    Amount: typeof Amount;
    AssetSymbol: typeof AssetSymbol;
    AssetType: typeof AssetType;
    BigDecimal: typeof BigDecimal;
    Decimals: typeof Decimals;
    EquityCategory: typeof EquityCategory;
    EquityClass: typeof EquityClass;
    EthereumAddress: typeof EthereumAddress;
    FiatCurrency: typeof FiatCurrency;
    FundCategory: typeof FundCategory;
    FundClass: typeof FundClass;
    Hash: typeof Hash;
    Hashes: typeof Hashes;
    Isin: typeof Isin;
    Pincode: typeof Pincode;
    Price: typeof Price;
    RoleMap: typeof RoleMap;
    Roles: typeof Roles;
    SecretCode: typeof SecretCode;
    StringifiedBigInt: typeof StringifiedBigInt;
    TimeUnit: typeof TimeUnit;
    Timestamp: typeof Timestamp;
    TwoFactorCode: typeof TwoFactorCode;
    UserRoles: typeof UserRoles;
    VerificationType: typeof VerificationType;
    VerificationCode: typeof VerificationCode;
  }
}

// Extend the Type system with custom validators
const t = Object.assign({}, tElysia);

t.Amount = Amount;
t.AssetSymbol = AssetSymbol;
t.AssetType = AssetType;
t.BigDecimal = BigDecimal;
t.Decimals = Decimals;
t.EquityCategory = EquityCategory;
t.EquityClass = EquityClass;
t.EthereumAddress = EthereumAddress;
t.FiatCurrency = FiatCurrency;
t.FundCategory = FundCategory;
t.FundClass = FundClass;
t.Hash = Hash;
t.Hashes = Hashes;
t.Isin = Isin;
t.Pincode = Pincode;
t.Price = Price;
t.RoleMap = RoleMap;
t.Roles = Roles;
t.SecretCode = SecretCode;
t.StringifiedBigInt = StringifiedBigInt;
t.TimeUnit = TimeUnit;
t.Timestamp = Timestamp;
t.TwoFactorCode = TwoFactorCode;
t.UserRoles = UserRoles;
t.VerificationCode = VerificationCode;
t.VerificationType = VerificationType;

export function safeParse<T extends TSchema>(
  schema: T,
  value: unknown
): StaticDecode<T> {
  let CompiledSchema = compiledSchemaCache.get(schema);

  if (!CompiledSchema) {
    CompiledSchema = TypeCompiler.Compile(schema);
    compiledSchemaCache.set(schema, CompiledSchema);
  }

  const errors = [...CompiledSchema.Errors(value)];
  if (errors.length > 0) {
    console.error(`\n${"=".repeat(80)}`);
    console.error("🚨 Typebox Validation Error");
    console.error("=".repeat(80));

    console.error("\n📥 Input Data:");
    console.error(redactSensitiveFields(value));

    console.error("\n❌ Error Details:");
    errors.forEach((error) => {
      console.error(
        `${error.path}: ${error.message} (${JSON.stringify(error.value)} = ${typeof error.value})`
      );
    });
    console.error("=".repeat(80));
    throw new Error(`Validation errors, see the console for more details`);
  }
  return CompiledSchema.Decode(value) as StaticDecode<T>;
}

export { t };
export type { StaticDecode, TSchema };
