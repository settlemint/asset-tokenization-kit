import type { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import type { Asset } from "../../entities/asset";
import { createPushAirdrop } from "./push-airdrop";
import { createTimeBoundAirdrop } from "./timebound-airdrop";

export const createAirdrops = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  // const vestingAirdrop = await createVestingAirdrop(asset, merkleTree);
  const pushAirdrop = await createPushAirdrop(asset, merkleTree);
  const timeBoundAirdrop = await createTimeBoundAirdrop(asset, merkleTree);

  return {
    // vestingAirdrop,
    pushAirdrop,
    timeBoundAirdrop,
  };
};
