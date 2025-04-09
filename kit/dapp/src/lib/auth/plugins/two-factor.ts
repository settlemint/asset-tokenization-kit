import { OTP_ALGORITHM, OTP_DIGITS, OTP_PERIOD } from "@/lib/auth/otp";
import { enableTwoFactorFunction } from "@/lib/mutations/user/two-factor/enable-two-factor-function";
import type { GenericEndpointContext } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { twoFactor } from "better-auth/plugins/two-factor";
import { disableTwoFactorFunction } from "../../mutations/user/two-factor/disable-two-factor-function";
import { verifyTwoFactorOTPFunction } from "../../mutations/user/two-factor/verify-two-factor-otp-function";
import type { User } from "../types";
import { revokeSession } from "./utils";

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
      const { response, headers } = await originalEnableTwoFactor(
        ctx as typeof ctx & { returnHeaders: true }
      );
      const { totpURI, verificationId } = await enableTwoFactorFunction({
        parsedInput: {
          algorithm: OTP_ALGORITHM,
          digits: OTP_DIGITS,
          period: OTP_PERIOD,
        },
        ctx: { user },
      });
      await revokeSession(ctx as GenericEndpointContext, {
        twoFactorVerificationId: verificationId,
      });
      for (const [name, value] of headers.entries()) {
        ctx.setHeader(name, value);
      }
      return ctx.json({ backupCodes: response.backupCodes, totpURI });
    }
  ),
  disableTwoFactor: createAuthEndpoint(
    originalDisableTwoFactor.path,
    originalDisableTwoFactor.options,
    async (ctx) => {
      const user = ctx.context.session.user as User;
      const { response, headers } = await originalDisableTwoFactor(
        ctx as typeof ctx & { returnHeaders: true }
      );
      if (response.status) {
        await disableTwoFactorFunction({ ctx: { user } });
      }
      for (const [name, value] of headers.entries()) {
        ctx.setHeader(name, value);
      }
      return ctx.json(response);
    }
  ),
  verifyTOTP: createAuthEndpoint(
    originalVerifyTOTP.path,
    originalVerifyTOTP.options,
    async (ctx) => {
      const user = ctx.context.session.user as User;
      const { code } = ctx.body;
      const result = await verifyTwoFactorOTPFunction({
        parsedInput: { code },
        ctx: { user },
      });
      if (!result?.verified) {
        return ctx.context.invalid();
      }
      if (!user.twoFactorEnabled) {
        await revokeSession(ctx as GenericEndpointContext, {
          twoFactorEnabled: true,
        });
      }
      return ctx.context.valid(ctx);
    }
  ),
};

export default plugin;
