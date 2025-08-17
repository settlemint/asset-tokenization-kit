import { AssetDesignerStepSchema } from "@/components/asset-designer/asset-designer-wizard/use-asset-designer-steps";
import { isRequiredFieldForZodIntersection } from "@/lib/utils/schema-field";
import type { KeysOfUnion } from "@/lib/utils/union";
import { assetClass } from "@/lib/zod/validators/asset-types";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

/**
 * Composite Zod schema for asset designer form that combines multiple validation concerns.
 *
 * @remarks
 * SCHEMA COMPOSITION: Uses Zod's `.and()` method to compose three distinct schemas:
 * 1. TokenCreateSchema - Core token creation parameters (name, symbol, supply, etc.)
 * 2. AssetDesignerStepSchema - UI step management and navigation state
 * 3. AssetClass validation - Ensures valid asset type selection (bond, equity, fund, etc.)
 *
 * VALIDATION STRATEGY: Intersection schemas provide comprehensive validation while
 * maintaining separation of concerns. Each schema handles its domain-specific validation rules.
 *
 * TYPE SAFETY: The composite schema ensures that all required fields across different
 * validation domains are properly typed and validated at both compile-time and runtime.
 */
export const AssetDesignerFormSchema = TokenCreateSchema.and(
  AssetDesignerStepSchema
).and(
  z.object({
    assetClass: assetClass(),
  })
);

/**
 * Input type for asset designer form data, derived from the composite schema.
 *
 * @remarks
 * Uses `z.input<>` to get the input type (before transformation) rather than `z.infer<>`
 * which would give the output type. This ensures proper typing for form initialization.
 */
export type AssetDesignerFormInputData = z.input<
  typeof AssetDesignerFormSchema
>;

/**
 * TanStack Form configuration options for the asset designer wizard.
 *
 * @remarks
 * INITIALIZATION: Provides sensible defaults for the multi-step form wizard.
 * The form starts at the "assetClass" step and includes default verification settings.
 *
 * VERIFICATION: Pre-configures wallet verification with OTP as the default method,
 * though users can change this in the verification dialog.
 */
export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    // WORKFLOW: Start the wizard at the asset class selection step
    step: "assetClass",
    // SECURITY: Initialize verification with safe defaults
    walletVerification: {
      secretVerificationCode: "",
      verificationType: "OTP",
    },
  } as AssetDesignerFormInputData,
});

/**
 * Utility function to determine if a field is required by the composite schema.
 *
 * @remarks
 * SCHEMA INTROSPECTION: Uses a custom utility to analyze Zod intersection schemas
 * and determine field requirements across all composed schemas. This is needed because
 * standard Zod introspection doesn't work well with complex intersection types.
 *
 * UI INTEGRATION: Used by form components to show required field indicators (*)
 * and apply appropriate validation styling.
 *
 * @param field - The field key to check for requirement status
 * @returns true if the field is required by any of the intersected schemas
 */
export const isRequiredField = (
  field: KeysOfUnion<AssetDesignerFormInputData>
) => {
  return isRequiredFieldForZodIntersection(AssetDesignerFormSchema, field);
};
