import hre from "hardhat";
import {
  Abi,
  Address,
  Chain,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
  encodeAbiParameters,
  formatEther,
  getContract as getViemContract,
  keccak256,
  parseAbiParameters,
} from "viem";
import {
  Account,
  LocalAccount,
  generatePrivateKey,
  privateKeyToAccount,
} from "viem/accounts";
import { ATKContracts } from "../constants/contracts";
import { KeyPurpose } from "../constants/key-purposes";
import { KeyType } from "../constants/key-types";
import { ATKTopic } from "../constants/topics";
import { atkDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { createClaim } from "../utils/create-claim";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { getPublicClient } from "../utils/public-client";
import { waitForEvent } from "../utils/wait-for-event";
import { waitForSuccess } from "../utils/wait-for-success";

// Chain to ensure identity creation operations are serialized across all actors
// To avoid replacement transactions when in sync
let identityCreationQueue: Promise<void> = Promise.resolve();

/**
 * Abstract base class for actors interacting with the blockchain.
 * An actor typically represents a user or an automated agent with its own wallet (Signer).
 * It requires HardhatRuntimeEnvironment for accessing ethers and contract artifacts.
 */
export class Actor {
  protected initialized = false;

  private accountIndex: number;
  private walletClient: WalletClient<Transport, Chain, Account> | null = null;
  private readonly signer: LocalAccount;

  protected _address: Address | undefined;
  protected _identityPromise: Promise<`0x${string}`> | undefined;
  protected _identity: `0x${string}` | undefined;

  public readonly name: string;
  public readonly countryCode: number;

  constructor(
    name: string,
    countryCode: number,
    accountIndex: number,
    privateKey?: `0x${string}`
  ) {
    this.name = name;
    this.countryCode = countryCode;
    this.accountIndex = accountIndex;

    const pk = privateKey ?? generatePrivateKey();
    this.signer = privateKeyToAccount(pk);
  }

  /**
   * Initializes the actor by fetching and storing the wallet client (Signer).
   * This method should typically be called once before any blockchain interactions.
   * Subclasses can override this to add more specific initialization logic,
   * ensuring they call `super.initialize()` if they override it.
   * @throws Error if the wallet client cannot be initialized.
   */
  async initialize(): Promise<void> {
    const wallets = await hre.viem.getWalletClients();

    if (!wallets[this.accountIndex]) {
      throw new Error("Could not get a default wallet client from Hardhat.");
    }
    this.walletClient = wallets[this.accountIndex];
    this._address = wallets[this.accountIndex].account.address;

    console.log(`[${this.name}] Address: ${this.address}`);

    this.initialized = true;
  }

  /**
   * Get the address of the claim issuer
   */
  get address(): Address {
    if (!this._address) {
      throw new Error("Address not initialized");
    }
    return this._address;
  }

  /**
   * Get the address of the signer
   */
  get signerAddress(): Address {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }
    return this.signer.address;
  }

  /**
   * Ensures the signer is initialized, calling `initialize()` if necessary.
   * @throws Error if the signer is not initialized after attempting to initialize.
   */
  protected async ensureSignerInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Synchronously returns the singleton WalletClient instance for the default signer.
   * Ensure `initializeDefaultWalletClient` has been called and completed before using this.
   *
   * @returns The default WalletClient instance.
   * @throws Error if the client has not been initialized via `initializeDefaultWalletClient`.
   */
  public getWalletClient(): WalletClient<Transport, Chain, Account> {
    if (!this.walletClient) {
      throw new Error("Wallet client not initialized");
    }

    return this.walletClient;
  }

  async getIdentity(): Promise<`0x${string}`> {
    if (this._identityPromise) {
      return this._identityPromise;
    }

    this._identityPromise = new Promise((resolve, reject) => {
      // Internal function to create the identity
      const createIdentity = async (): Promise<`0x${string}`> => {
        const identityFactory = atkDeployer.getIdentityFactoryContract();
        const createIdentityTransactionHash = await withDecodedRevertReason(
          () => identityFactory.write.createIdentity([this.address, []])
        );

        const { identity: identityAddress } = (await waitForEvent({
          transactionHash: createIdentityTransactionHash,
          contract: identityFactory,
          eventName: "IdentityCreated",
        })) as { identity: `0x${string}` };

        const identityContract = this.getContractInstance({
          address: identityAddress,
          abi: ATKContracts.identity,
        });

        const addKeyTransactionHash = await withDecodedRevertReason(() =>
          identityContract.write.addKey([
            keccak256(
              encodeAbiParameters(parseAbiParameters("address"), [
                this.signer.address,
              ])
            ),
            KeyPurpose.claimSigner,
            KeyType.ecdsa,
          ])
        );

        await waitForSuccess(addKeyTransactionHash);

        this._identity = identityAddress;
        console.log(`[${this.name}] identity: ${identityAddress}`);

        return identityAddress;
      };

      // Chain this identity creation to the queue
      identityCreationQueue = identityCreationQueue
        .then(async () => {
          try {
            const identity = await createIdentity();
            resolve(identity);
          } catch (error) {
            console.error(`[${this.name}] Failed to create identity:`, error);
            reject(error);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

    return this._identityPromise;
  }

  /**
   * Creates a Viem contract instance.
   * For zero gas, pass { gas: 0n } as the second argument to write calls.
   * Set useGasEstimation to true for standard gas estimation.
   *
   * @template TAbi - The ABI of the contract.
   * @param {Object} params - The parameters for creating the contract instance.
   * @param {Address} params.address - The address of the contract.
   * @param {TAbi} params.abi - The ABI of the contract.
   * @returns {GetContractReturnType<TAbi, { public: PublicClient; wallet: WalletClient }>} The Viem contract instance.
   */
  getContractInstance<TAbi extends Abi>({
    address,
    abi,
  }: {
    address: Address;
    abi: TAbi;
  }): GetContractReturnType<
    TAbi,
    { public: PublicClient; wallet: WalletClient<Transport, Chain, Account> }
  > {
    const walletClient = this.getWalletClient();

    // Create and return the base contract instance
    // Note: For zero gas, manually pass { gas: 0n } to write calls
    return getViemContract({
      address,
      abi,
      client: { public: getPublicClient(), wallet: walletClient },
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

  async getBalance() {
    const publicClient = getPublicClient();
    return publicClient.getBalance({
      address: this.address,
    });
  }

  async printBalance() {
    const ethBalance = await this.getBalance();
    console.log(`[${this.name}] ETH Balance: ${formatEther(ethBalance)} ETH`);
  }
}
