import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { updateExchangeRates } from "./exchange-rates";

const ExchangeRateUpdateResponseSchema = t.Object({
  success: t.Boolean({
    description: "Whether the update operation was successful",
  }),
  message: t.String({
    description: "A message describing the result of the operation",
  }),
  timestamp: t.String({
    description: "The timestamp when the update was completed",
  }),
});

export const ExchangeRateUpdateApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .patch(
    "/",
    async () => {
      try {
        await updateExchangeRates();
        return {
          success: true,
          message: "Exchange rates updated successfully",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          timestamp: new Date().toISOString(),
        };
      }
    },
    {
      auth: true,
      detail: {
        summary: "Update",
        description:
          "Updates all exchange rates by fetching current data from Yahoo Finance.",
        tags: ["provider"],
      },
      response: {
        200: ExchangeRateUpdateResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
