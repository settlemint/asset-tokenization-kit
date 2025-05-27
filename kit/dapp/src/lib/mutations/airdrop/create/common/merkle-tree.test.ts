import { describe, expect, test } from "bun:test";
import { MerkleTree } from "merkletreejs";
import type { Hex } from "viem";
import type {
  AirdropDistribution,
  AirdropDistributionList,
} from "./airdrop-distribution-schema";

import {
  createMerkleTree,
  getMerkleProof,
  getMerkleRoot,
  verifyMerkleProof,
} from "./merkle-tree";

const sampleLeaves: AirdropDistributionList = [
  {
    index: 0,
    recipient: "0x1111111111111111111111111111111111111111",
    amount: "100",
  },
  {
    index: 1,
    recipient: "0x2222222222222222222222222222222222222222",
    amount: "200",
  },
  {
    index: 2,
    recipient: "0x3333333333333333333333333333333333333333",
    amount: "300",
  },
];

const anotherLeafSet: AirdropDistributionList = [
  {
    index: 0,
    recipient: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    amount: "1000",
  },
  {
    index: 1,
    recipient: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    amount: "2000",
  },
];

// A leaf that is part of the sampleLeaves
const validLeafFromSample: AirdropDistribution = sampleLeaves[0];

// A leaf that is NOT part of the sampleLeaves
const invalidLeafForSample: AirdropDistribution = {
  index: 3,
  recipient: "0x4444444444444444444444444444444444444444",
  amount: "400",
};

describe("Merkle Tree Utilities", () => {
  describe("createMerkleTree and getMerkleRoot", () => {
    test("should create a MerkleTree instance and compute its root", () => {
      const tree = createMerkleTree(sampleLeaves);
      expect(tree).toBeInstanceOf(MerkleTree);
      // The number of leaves in the tree should match the input
      expect(tree.getLeafCount()).toBe(sampleLeaves.length);

      const root = getMerkleRoot(sampleLeaves);
      expect(root).toMatch(/^0x[0-9a-fA-F]{64}$/); // Root should be a 32-byte hex string
      expect(root).toBe(tree.getHexRoot() as Hex); // Explicitly cast to Hex
    });

    test("should produce consistent root for the same ordered set of leaves", () => {
      const root1 = getMerkleRoot(sampleLeaves);
      const root2 = getMerkleRoot([...sampleLeaves]); // Same leaves, same order
      expect(root1).toBe(root2);
    });

    test("should produce different roots for different sets of leaves", () => {
      const root1 = getMerkleRoot(sampleLeaves);
      const root2 = getMerkleRoot(anotherLeafSet);
      expect(root1).not.toBe(root2);
    });

    test("should produce different roots if leaf order changes (as initial leaf order matters)", () => {
      const reorderedSampleLeaves: AirdropDistributionList = [
        sampleLeaves[1],
        sampleLeaves[0],
        sampleLeaves[2],
      ];
      const root1 = getMerkleRoot(sampleLeaves);
      const root2 = getMerkleRoot(reorderedSampleLeaves);
      expect(root1).not.toBe(root2);
    });
  });

  describe("getMerkleProof", () => {
    test("should return a valid proof for a leaf in the tree", () => {
      const tree = createMerkleTree(sampleLeaves);
      const proof = getMerkleProof(validLeafFromSample, tree);
      expect(Array.isArray(proof)).toBe(true);
      proof.forEach((p) => expect(p).toMatch(/^0x[0-9a-fA-F]{64}$/));
      // For 3 leaves, with sortPairs=true, merkletreejs may balance, proof length is often ceil(log2(N))
      expect(proof.length).toBeGreaterThanOrEqual(1); // For 3 leaves, it's 2
      if (sampleLeaves.length === 3) {
        expect(proof.length).toBe(2); // More specific for this case
      }
    });

    test("should return an empty proof for a single-leaf tree", () => {
      const singleLeafList: AirdropDistributionList = [validLeafFromSample];
      const tree = createMerkleTree(singleLeafList);
      const proof = getMerkleProof(validLeafFromSample, tree);
      expect(proof).toEqual([]);
    });
  });

  describe("verifyMerkleProof", () => {
    const tree = createMerkleTree(sampleLeaves);
    const root = tree.getHexRoot() as Hex;

    test("should return true for a valid leaf, proof, and root", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      const isValid = verifyMerkleProof(validLeafFromSample, proof, root);
      expect(isValid).toBe(true);
    });

    test("should return true for all leaves in the tree", () => {
      for (const leaf of sampleLeaves) {
        const proof = getMerkleProof(leaf, tree);
        const isValid = verifyMerkleProof(leaf, proof, root);
        expect(isValid).toBe(true);
      }
    });

    test("should return false for an invalid leaf (not in the tree) using a valid proof from another leaf", () => {
      const proofForValidLeaf = getMerkleProof(sampleLeaves[0], tree);
      // Attempt to verify a leaf not in the original set, using a proof for a leaf that was.
      const isValid = verifyMerkleProof(
        invalidLeafForSample,
        proofForValidLeaf,
        root
      );
      expect(isValid).toBe(false);
    });

    test("should return false for a valid leaf with an incorrect (corrupted) proof", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      if (proof.length === 0 && sampleLeaves.length > 1) {
        // This case should not be hit for sampleLeaves (3 leaves), proof will not be empty.
        // This assertion is to make sure the test logic below is sound.
        expect(proof.length).toBeGreaterThan(0);
      }

      const corruptedProof: Hex[] =
        proof.length > 0
          ? [
              "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex,
              ...proof.slice(1),
            ]
          : [
              "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex,
            ]; // Replace first element or add one if empty

      const isValid = verifyMerkleProof(
        validLeafFromSample,
        corruptedProof,
        root
      );
      expect(isValid).toBe(false);
    });

    test("should return false for a valid leaf with an incomplete proof", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      // This test is only meaningful if there's a proof to make incomplete
      if (proof.length > 0) {
        const incompleteProof = proof.slice(0, proof.length - 1);
        const isValid = verifyMerkleProof(
          validLeafFromSample,
          incompleteProof,
          root
        );
        expect(isValid).toBe(false);
      } else {
        // For sampleLeaves (3 leaves), proof length is 2.
        // This path should not be taken for sampleLeaves.
        // If it were a single leaf tree, proof is [], this test would pass vacuously or needs adjustment.
        expect(proof.length).toBeGreaterThan(0); // Ensure this test runs as expected for sampleLeaves
      }
    });

    test("should return false for a valid leaf and proof with an incorrect root", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      const incorrectRoot =
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as Hex;
      const isValid = verifyMerkleProof(
        validLeafFromSample,
        proof,
        incorrectRoot
      );
      expect(isValid).toBe(false);
    });

    test("verification with empty proof should only work for single-leaf tree", () => {
      // Test with the multi-leaf tree (sampleLeaves)
      const isValidForMultiLeaf = verifyMerkleProof(
        validLeafFromSample,
        [],
        root
      );
      expect(isValidForMultiLeaf).toBe(false); // Expect false because proof is required

      // Test with a single-leaf tree
      const singleLeafList: AirdropDistributionList = [validLeafFromSample];
      const singleLeafTree = createMerkleTree(singleLeafList);
      const singleLeafRoot = singleLeafTree.getHexRoot() as Hex;
      const proofForSingleLeaf = getMerkleProof(
        validLeafFromSample,
        singleLeafTree
      ); // This will be []

      expect(proofForSingleLeaf).toEqual([]);
      const isValidForSingleLeaf = verifyMerkleProof(
        validLeafFromSample,
        proofForSingleLeaf,
        singleLeafRoot
      );
      expect(isValidForSingleLeaf).toBe(true);
    });
  });
});
