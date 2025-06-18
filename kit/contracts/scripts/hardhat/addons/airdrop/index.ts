import type { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import type { Asset } from "../../entities/asset";
import { createPushAirdrop } from "./push-airdrop";
import { createVestingAirdrop } from "./vesting-airdrop";

export const createAirdrops = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  const vestingAirdrop = await createVestingAirdrop(asset, merkleTree);
  const pushAirdrop = await createPushAirdrop(asset, merkleTree);

  return {
    vestingAirdrop,
    pushAirdrop,
  };
};
