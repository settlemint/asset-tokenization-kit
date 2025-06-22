import type { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import type { Asset } from "../../entities/asset";
import { createPushAirdrop } from "./push-airdrop";
import { createVestingAirdrop } from "./vesting-airdrop";
import { createTimeboundAirdrop } from "./timebound-airdrop";

export const createAirdrops = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  const vestingAirdrop = await createVestingAirdrop(asset, merkleTree);
  const pushAirdrop = await createPushAirdrop(asset, merkleTree);
  const timeboundAirdrop = await createTimeboundAirdrop(asset, merkleTree);

  return {
    vestingAirdrop,
    pushAirdrop,
    timeboundAirdrop,
  };
};
