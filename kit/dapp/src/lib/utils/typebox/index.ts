import { t as tElysia } from "elysia/type-system";

import type { StaticDecode, TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
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
import { RoleMap, Roles } from "./roles";
import { TimeUnit } from "./time-units";
import { Timestamp } from "./timestamp";
import { UserRoles } from "./user-roles";

// Extend TypeBox types with module augmentation
declare module "@sinclair/typebox" {
  interface JavaScriptTypeBuilder {
    EthereumAddress: typeof EthereumAddress;
    Amount: typeof Amount;
    BigDecimal: typeof BigDecimal;
    Decimals: typeof Decimals;
    AssetType: typeof AssetType;
    EquityCategory: typeof EquityCategory;
    EquityClass: typeof EquityClass;
    FiatCurrency: typeof FiatCurrency;
    FundCategory: typeof FundCategory;
    FundClass: typeof FundClass;
    Hash: typeof Hash;
    Hashes: typeof Hashes;
    Isin: typeof Isin;
    Pincode: typeof Pincode;
    Roles: typeof Roles;
    RoleMap: typeof RoleMap;
    AssetSymbol: typeof AssetSymbol;
    TimeUnit: typeof TimeUnit;
    Timestamp: typeof Timestamp;
    StringifiedBigInt: typeof StringifiedBigInt;
    UserRoles: typeof UserRoles;
  }
}

// Extend the Type system with custom validators
const t = Object.assign({}, tElysia);

t.EthereumAddress = EthereumAddress;
t.Amount = Amount;
t.BigDecimal = BigDecimal;
t.Decimals = Decimals;
t.AssetType = AssetType;
t.EquityCategory = EquityCategory;
t.EquityClass = EquityClass;
t.FiatCurrency = FiatCurrency;
t.FundCategory = FundCategory;
t.FundClass = FundClass;
t.Hash = Hash;
t.Hashes = Hashes;
t.Isin = Isin;
t.Pincode = Pincode;
t.Roles = Roles;
t.RoleMap = RoleMap;
t.AssetSymbol = AssetSymbol;
t.TimeUnit = TimeUnit;
t.Timestamp = Timestamp;
t.StringifiedBigInt = StringifiedBigInt;
t.UserRoles = UserRoles;

export function safeParse<T extends TSchema>(
  schema: T,
  value: unknown
): StaticDecode<T> {
  const errors = [...Value.Errors(schema, value)];
  if (errors.length > 0) {
    console.error(`\n${"=".repeat(80)}`);
    console.error("🚨 Typebox Validation Error");
    console.error("=".repeat(80));

    console.error("\n📥 Input Data:");
    console.error(redactSensitiveFields(value));

    console.error("\n❌ Error Details:");
    errors.map((error) => {
      console.error(
        `${error.path}: ${error.message} (${JSON.stringify(error.value)} = ${typeof error.value})`
      );
    });
    console.error("=".repeat(80));
    throw new Error(`Validation errors, see the console for more details`);
  }
  return Value.Parse(schema, value);
}

export { t };
export type { StaticDecode, TSchema };
