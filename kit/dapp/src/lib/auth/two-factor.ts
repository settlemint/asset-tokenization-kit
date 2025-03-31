import { OTP_ALGORITHM, OTP_DIGITS, OTP_PERIOD } from "@/lib/auth/otp";
import { enableTwoFactorFunction } from "@/lib/mutations/user/enable-two-factor-function";
import { createAuthEndpoint } from "better-auth/api";
import { twoFactor } from "better-auth/plugins/two-factor";
import { disableTwoFactorFunction } from "../mutations/user/disable-two-factor-function";
import { verifyTwoFactorOTPFunction } from "../mutations/user/verify-two-factor-otp-function";
import type { User } from "./types";
const plugin = twoFactor({
  totpOptions: {
    digits: OTP_DIGITS,
    period: OTP_PERIOD,
  },
});

const originalEnableTwoFactor = plugin.endpoints.enableTwoFactor;
const originalDisableTwoFactor = plugin.endpoints.disableTwoFactor;
const originalVerifyTOTP = plugin.endpoints.verifyTOTP;

plugin.endpoints = {
  ...plugin.endpoints,
  enableTwoFactor: createAuthEndpoint(
    originalEnableTwoFactor.path,
    originalEnableTwoFactor.options,
    async (...args) => {
      const { backupCodes } = await originalEnableTwoFactor(...args);
      const { totpURI } = await enableTwoFactorFunction({
        parsedInput: {
          algorithm: OTP_ALGORITHM,
          digits: OTP_DIGITS,
          period: OTP_PERIOD,
        },
      });
      return { backupCodes, totpURI };
    }
  ),
  disableTwoFactor: createAuthEndpoint(
    originalDisableTwoFactor.path,
    originalDisableTwoFactor.options,
    async (...args) => {
      const { status } = await originalDisableTwoFactor(...args);
      await disableTwoFactorFunction();
      return { status };
    }
  ),
  verifyTOTP: createAuthEndpoint(
    originalVerifyTOTP.path,
    originalVerifyTOTP.options,
    async (ctx) => {
      const user = ctx.context.session.user as User;
      const { code } = ctx.body;
      const result = await verifyTwoFactorOTPFunction({
        parsedInput: { code: Number(code) },
        ctx: { user },
      });
      if (!result?.verified) {
        return ctx.context.invalid();
      }
      return ctx.context.valid(ctx);
    }
  ),
};

export default plugin;
