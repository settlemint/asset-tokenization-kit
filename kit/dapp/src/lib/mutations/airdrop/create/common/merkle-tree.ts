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

function createMerkleLeaf(leaf: AirdropDistribution): Hex {
  // First hash: keccak256(abi.encode(index, account, amountExact))
  const firstHash = keccak256(
    encodeAbiParameters(parseAbiParameters("uint256, address, uint256"), [
      BigInt(leaf.index),
      leaf.recipient,
      BigInt(leaf.amountExact),
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
    leaves.map((leaf) => createMerkleLeaf(leaf)),
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
  const leafHash = createMerkleLeaf(leaf);
  return tree.getHexProof(leafHash) as Hex[];
};

export const verifyMerkleProof = (
  leaf: AirdropDistribution,
  proof: Hex[],
  root: Hex
): boolean => {
  const tree = createMerkleTree([leaf]);
  const leafHash = createMerkleLeaf(leaf);
  return tree.verify(proof, leafHash, root);
};
