import { MerkleTree } from "merkletreejs";
import {
  encodeAbiParameters,
  type Hex,
  keccak256,
  parseAbiParameters,
} from "viem";
import type {
  AirdropDistribution,
  AirdropDistributionList,
} from "./airdrop-distribution-schema";

function createMerkleLeaf(
  index: bigint,
  account: `0x${string}`,
  amount: bigint
): Hex {
  // First hash: keccak256(abi.encode(index, account, amount))
  const firstHash = keccak256(
    encodeAbiParameters(parseAbiParameters("uint256, address, uint256"), [
      index,
      account,
      amount,
    ])
  );

  // Second hash: keccak256(abi.encode(firstHash))
  const node = keccak256(
    encodeAbiParameters(parseAbiParameters("bytes32"), [firstHash])
  );

  return node;
}

export const createMerkleTree = (leaves: AirdropDistributionList): MerkleTree =>
  new MerkleTree(
    leaves.map((leaf) =>
      createMerkleLeaf(BigInt(leaf.index), leaf.recipient, BigInt(leaf.amount))
    ),
    keccak256,
    { sort: true }
  );

export const getMerkleRoot = (leaves: AirdropDistributionList): Hex => {
  const tree = createMerkleTree(leaves);
  return tree.getHexRoot() as Hex;
};

export const getMerkleProof = (
  leaf: AirdropDistribution,
  tree: MerkleTree
): Hex[] => {
  const leafHash = createMerkleLeaf(
    BigInt(leaf.index),
    leaf.recipient,
    BigInt(leaf.amount)
  );
  return tree.getHexProof(leafHash) as Hex[];
};

export const verifyMerkleProof = (
  leaf: AirdropDistribution,
  proof: Hex[],
  root: Hex
): boolean => {
  const tree = createMerkleTree([leaf]);
  const leafHash = createMerkleLeaf(
    BigInt(leaf.index),
    leaf.recipient,
    BigInt(leaf.amount)
  );
  return tree.verify(proof, leafHash, root);
};
