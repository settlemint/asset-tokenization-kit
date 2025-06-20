import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";
import { Pincode } from "./pincode";
import { SecretCode } from "./secret-code";
import { TwoFactorCode } from "./two-factor-code";

/**
 * TypeBox schema for validating verification codes
 *
 * This module provides a TypeBox schema for validating verification codes,
 * ensuring they are either a PIN code, two-factor code, or secret code.
 */
export const VerificationCode = (options?: SchemaOptions) =>
  t.Union([Pincode(), TwoFactorCode(), SecretCode()], {
    ...options,
  });
