import { describe, expect, test } from "bun:test";
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
  });

  describe("getMerkleProof", () => {
    test("should return a valid proof for a leaf in the tree", () => {
      const tree = createMerkleTree(sampleLeaves);
      const proofs = sampleLeaves.map((leaf) => getMerkleProof(leaf, tree));

      proofs.forEach((proof) => {
        expect(Array.isArray(proof)).toBe(true);
        proof.forEach((p) => expect(p).toMatch(/^0x[0-9a-fA-F]{64}$/));
      });

      // For a balanced binary tree with 3 leaves, two proofs should have length 2 and one should have length 1
      const proofLengths = proofs.map((proof) => proof.length);
      expect(proofLengths.filter((length) => length === 2)).toHaveLength(2);
      expect(proofLengths.filter((length) => length === 1)).toHaveLength(1);
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
      expect(proofForValidLeaf.length).toBeGreaterThan(0);

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

      expect(proof.length).toBeGreaterThan(0);
      const corruptedProof: Hex[] = [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        ...proof.slice(1),
      ]; // Replace first element

      const isValid = verifyMerkleProof(
        validLeafFromSample,
        corruptedProof,
        root
      );
      expect(isValid).toBe(false);
    });

    test("should return false for a valid leaf with an incomplete proof", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      expect(proof.length).toBeGreaterThan(0);

      const incompleteProof = proof.slice(0, proof.length - 1);
      const isValid = verifyMerkleProof(
        validLeafFromSample,
        incompleteProof,
        root
      );
      expect(isValid).toBe(false);
    });

    test("should return false for a valid leaf and proof with an incorrect root", () => {
      const proof = getMerkleProof(validLeafFromSample, tree);
      const incorrectRoot =
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
      const isValid = verifyMerkleProof(
        validLeafFromSample,
        proof,
        incorrectRoot
      );
      expect(isValid).toBe(false);
    });

    test("verification with empty proof should only work for single-leaf tree", () => {
      const singleLeafList: AirdropDistributionList = [validLeafFromSample];
      const singleLeafTree = createMerkleTree(singleLeafList);
      const singleLeafRoot = singleLeafTree.getHexRoot() as Hex;
      const proofForSingleLeaf = getMerkleProof(
        validLeafFromSample,
        singleLeafTree
      );
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
