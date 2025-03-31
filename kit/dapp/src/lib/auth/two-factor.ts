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
    async (ctx) => {
      const user = ctx.context.session.user as User;
      const r = await originalEnableTwoFactor({
        ...ctx,
        asResponse: false,
        returnHeaders: false,
        skipVerificationOnEnable: true,
      });
      const { totpURI } = await enableTwoFactorFunction({
        parsedInput: {
          algorithm: OTP_ALGORITHM,
          digits: OTP_DIGITS,
          period: OTP_PERIOD,
        },
        ctx: { user },
      });
      return { backupCodes: r.backupCodes, totpURI };
    }
  ),
  disableTwoFactor: createAuthEndpoint(
    originalDisableTwoFactor.path,
    originalDisableTwoFactor.options,
    async (ctx) => {
      const user = ctx.context.session.user as User;
      const { status } = await originalDisableTwoFactor({
        ...ctx,
        asResponse: false,
        returnHeaders: false,
      });
      if (status) {
        await disableTwoFactorFunction({ ctx: { user } });
      }
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
