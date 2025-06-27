import hre from 'hardhat';
import {
  type Chain,
  createWalletClient,
  custom,
  type Transport,
  type WalletClient,
} from 'viem';
import type { Account, LocalAccount } from 'viem/accounts'; // viem signer type
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { Countries } from '../../constants/countries';
import type { ATKTopic } from '../../constants/topics';
import { topicManager } from '../../services/topic-manager';
import { createClaim } from '../../utils/create-claim';
import { getViemChain } from '../../utils/viem-chain';
import { AbstractActor } from './abstract-actor';

/**
 * Class representing a claim issuer that can generate and sign claims
 */
class ClaimIssuer extends AbstractActor {
  private readonly signer: LocalAccount;
  /**
   * Create a new claim issuer
   * @param privateKey - Optional private key for the signer. If not provided, a random one will be generated.
   */
  constructor(privateKey?: `0x${string}`) {
    super('Claim issuer', Countries.BE);

    const pk = privateKey ?? generatePrivateKey();
    this.signer = privateKeyToAccount(pk);
    this._address = this.signer.address;
  }

  public async initialize(): Promise<void> {
    await super.initialize();
  }

  /**
   * Get a viem WalletClient for this issuer's account.
   * @returns A WalletClient instance.
   * @example
   * ```ts
   * import { sepolia } from "viem/chains";
   * import { http } from "viem";
   * const issuer = new ClaimIssuer();
   * const walletClient = issuer.getWalletClient({
   *   chain: sepolia,
   *   transport: http("https://rpc.sepolia.org")
   * });
   * ```
   */
  public getWalletClient(): WalletClient<Transport, Chain, Account> {
    const viemChain = getViemChain();
    return createWalletClient({
      account: this.signer,
      chain: viemChain,
      transport: custom(hre.network.provider), // Use Hardhat's EIP-1193 provider
    });
  }

  /**
   * Create a claim signed by this issuer
   * @param subjectIdentityAddress - The address of the identity to attach the claim to
   * @param claimTopic - The topic of the claim
   * @param claimData - The data of the claim
   * @returns The claim data and signature
   */
  async createClaim(
    subjectIdentityAddress: `0x${string}`,
    claimTopic: ATKTopic,
    claimData: `0x${string}`
  ): Promise<{
    data: `0x${string}`;
    signature: `0x${string}`;
    topicId: bigint;
  }> {
    return createClaim(
      this.signer,
      subjectIdentityAddress,
      topicManager.getTopicId(claimTopic),
      claimData
    );
  }
}

/**
 * A reusable instance of the ClaimIssuer with a consistent address
 */
export const claimIssuer = new ClaimIssuer();
