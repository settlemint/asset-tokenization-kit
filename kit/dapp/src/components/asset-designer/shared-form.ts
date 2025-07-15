import { BondSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create.schema";
import { FundSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create.schema";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const AssetTypeSchema = TokenBaseSchema.pick({
  type: true,
});

export const BasicsSchema = TokenBaseSchema.pick({
  name: true,
  symbol: true,
  decimals: true,
  isin: true,
  type: true,
});

export const AssetBasicsSchema = z.discriminatedUnion("type", [
  BasicsSchema.extend(BondSchema.shape),
  BasicsSchema.extend(FundSchema.shape),
]);

export type AssetTypeForm = z.infer<typeof AssetTypeSchema>;

export const AssetDesignerFormSchema = z.union([
  AssetTypeSchema,
  AssetBasicsSchema,
]);
export type AssetDesignerFormData = z.infer<typeof AssetDesignerFormSchema>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {} as AssetDesignerFormData,
});
