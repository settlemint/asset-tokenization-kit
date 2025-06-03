import { oc } from "@orpc/contract";
import z from "zod/v4";

export const pc = oc.errors({
  INPUT_VALIDATION_FAILED: {
    status: 422,
    message: "Input validation failed",
    data: z.object({
      errors: z.array(z.string()),
    }),
  },
  OUTPUT_VALIDATION_FAILED: {
    status: 522,
    message: "Output validation failed",
    data: z.object({
      errors: z.array(z.string()),
    }),
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: "Internal server error",
  },
});
