import { MerkleTree } from 'merkletreejs';
import {
  type Address,
  encodeAbiParameters,
  type Hex,
  keccak256,
  parseAbiParameters,
} from 'viem';

/**
 * Represents a single airdrop distribution entry
 */
export interface AirdropDistribution {
  /** The index of the recipient in the Merkle tree */
  index: number;
  /** The amount of tokens for the recipient */
  amount: bigint;
  /** The address of the recipient */
  recipient: Address;
}

/**
 * Array of airdrop distribution entries
 */
export type AirdropDistributionList = AirdropDistribution[];

/**
 * Merkle tree class for airdrop distributions
 * Encapsulates all merkle tree operations including creation, proof generation, and verification
 */
export class AirdropMerkleTree {
  private tree: MerkleTree;
  private leaves: AirdropDistributionList;

  constructor(leaves: AirdropDistributionList) {
    this.leaves = leaves;
    this.tree = this.createMerkleTree(leaves);
  }

  /**
   * Creates a merkle leaf hash for a distribution entry
   * Uses double hashing: keccak256(abi.encode(keccak256(abi.encode(index, account, amount))))
   */
  private createMerkleLeaf(
    index: bigint,
    account: Address,
    amount: bigint
  ): Hex {
    // First hash: keccak256(abi.encode(index, account, amount))
    const firstHash = keccak256(
      encodeAbiParameters(parseAbiParameters('uint256, address, uint256'), [
        index,
        account,
        amount,
      ])
    );

    // Second hash: keccak256(abi.encode(firstHash))
    const node = keccak256(
      encodeAbiParameters(parseAbiParameters('bytes32'), [firstHash])
    );

    return node;
  }

  /**
   * Creates a merkle tree from the distribution list
   */
  private createMerkleTree(leaves: AirdropDistributionList): MerkleTree {
    return new MerkleTree(
      leaves.map((leaf) =>
        this.createMerkleLeaf(BigInt(leaf.index), leaf.recipient, leaf.amount)
      ),
      keccak256,
      { sort: true }
    );
  }

  /**
   * Gets the merkle root of the tree
   */
  public getRoot(): Hex {
    return this.tree.getHexRoot() as Hex;
  }

  /**
   * Gets the merkle proof for a specific distribution entry
   */
  public getProof(leaf: AirdropDistribution): Hex[] {
    const leafHash = this.createMerkleLeaf(
      BigInt(leaf.index),
      leaf.recipient,
      leaf.amount
    );
    return this.tree.getHexProof(leafHash) as Hex[];
  }

  /**
   * Verifies a merkle proof for a distribution entry
   */
  public verifyProof(
    leaf: AirdropDistribution,
    proof: Hex[],
    root?: Hex
  ): boolean {
    const leafHash = this.createMerkleLeaf(
      BigInt(leaf.index),
      leaf.recipient,
      leaf.amount
    );
    const rootToVerify = root || this.getRoot();
    return this.tree.verify(proof, leafHash, rootToVerify);
  }

  /**
   * Gets the underlying MerkleTree instance
   */
  public getTree(): MerkleTree {
    return this.tree;
  }

  /**
   * Gets the distribution list used to create this tree
   */
  public getLeaves(): AirdropDistributionList {
    return [...this.leaves]; // Return a copy to prevent mutation
  }

  /**
   * Static factory method to create a merkle tree from distribution list
   */
  static fromDistribution(leaves: AirdropDistributionList): AirdropMerkleTree {
    return new AirdropMerkleTree(leaves);
  }

  /**
   * Static method to create a merkle root directly from distribution list
   */
  static getMerkleRoot(leaves: AirdropDistributionList): Hex {
    return new AirdropMerkleTree(leaves).getRoot();
  }

  /**
   * Static method to verify a proof without creating a full tree instance
   */
  static verifyMerkleProof(
    leaf: AirdropDistribution,
    proof: Hex[],
    root: Hex
  ): boolean {
    const tree = new AirdropMerkleTree([leaf]);
    return tree.verifyProof(leaf, proof, root);
  }
}
