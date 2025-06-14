import { OTP_DIGITS, OTP_PERIOD } from "@/lib/auth/otp";
import type { GenericEndpointContext } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { twoFactor } from "better-auth/plugins/two-factor";
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
      if (user.initialOnboardingFinished) {
        const { headers } = await originalEnableTwoFactor(
          ctx as typeof ctx & { returnHeaders: true }
        );
        for (const [name, value] of headers.entries()) {
          ctx.setHeader(name, value);
        }
      }
      // TODO JAN: Remove this once we have the mutation
      // const { totpURI, verificationId } = await enableTwoFactorFunction({
      //   parsedInput: {
      //     algorithm: OTP_ALGORITHM,
      //     digits: OTP_DIGITS,
      //     period: OTP_PERIOD,
      //   },
      //   ctx: { user },
      // });
      const result = {
        totpURI: "123",
        verificationId: "123",
      };
      await revokeSession(ctx as GenericEndpointContext, {
        twoFactorVerificationId: result.verificationId,
      });
      return ctx.json({ backupCodes: [], totpURI: result.totpURI });
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
        // TODO JAN: Remove this once we have the mutation
        // await disableTwoFactorFunction({ ctx: { user } });
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
      // TODO JAN: Remove this once we have the mutation
      // const result = await verifyTwoFactorOTPFunction({
      //   parsedInput: { code },
      //   ctx: { user },
      // });
      const result = {
        verified: true,
      };
      if (!result?.verified) {
        return ctx.context.invalid();
      }
      if (!user.twoFactorEnabled) {
        await revokeSession(ctx as GenericEndpointContext, {
          initialOnboardingFinished: true,
          twoFactorEnabled: true,
        });
      }
      return ctx.context.valid(ctx);
    }
  ),
};

export default plugin;
