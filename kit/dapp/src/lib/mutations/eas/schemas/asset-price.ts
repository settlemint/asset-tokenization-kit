import type { Address } from "viem";

export const assetPriceSchema = `address Asset,uint256 Price,string Currency`;
export const assetPriceSchemaResolver: Address =
  "0x0000000000000000000000000000000000000000";
export const assetPriceSchemaRevocable = false;
