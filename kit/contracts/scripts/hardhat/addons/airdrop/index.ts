import type { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import type { Asset } from "../../entities/asset";
import { createVestingAirdrop } from "./vesting-airdrop";

export const createAirdrops = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  const vestingAirdrop = await createVestingAirdrop(asset, merkleTree);

  return {
    vestingAirdrop,
  };
};
