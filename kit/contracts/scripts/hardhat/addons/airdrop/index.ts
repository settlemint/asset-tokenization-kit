import type { Asset } from "../../entities/asset";
import { createVestingAirdrop } from "./vesting-airdrop";

export const createAirdrops = async (asset: Asset<any>) => {
  const vestingAirdrop = await createVestingAirdrop(asset);

  return {
    vestingAirdrop,
  };
};
