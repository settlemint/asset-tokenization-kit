import {
  type Abi,
  type Address,
  type Chain,
  formatEther,
  type GetContractReturnType,
  getContract as getViemContract,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import type { Account } from 'viem/accounts';
import { atkDeployer } from '../../services/deployer';
import { withDecodedRevertReason } from '../../utils/decode-revert-reason';
import { getPublicClient } from '../../utils/public-client';
import { waitForEvent } from '../../utils/wait-for-event';

// Chain to ensure identity creation operations are serialized across all actors
// To avoid replacement transactions when in sync
let identityCreationQueue: Promise<void> = Promise.resolve();

/**
 * Abstract base class for actors interacting with the blockchain.
 * An actor typically represents a user or an automated agent with its own wallet (Signer).
 * It requires HardhatRuntimeEnvironment for accessing ethers and contract artifacts.
 */
export abstract class AbstractActor {
  protected initialized = false;

  protected _address: Address | undefined;
  protected _identityPromise: Promise<`0x${string}`> | undefined;
  protected _identity: `0x${string}` | undefined;

  public readonly name: string;
  public readonly countryCode: number;
  constructor(name: string, countryCode: number) {
    this.name = name;
    this.countryCode = countryCode;
  }
  /**
   * Abstract method to be implemented by subclasses.
   * It should retrieve or create an ethers.js Signer instance representing the actor's wallet.
   * @returns A Promise that resolves to an ethers Signer.
   */
  abstract getWalletClient(): WalletClient<Transport, Chain, Account>;

  /**
   * Initializes the actor by fetching and storing the wallet client (Signer).
   * This method should typically be called once before any blockchain interactions.
   * Subclasses can override this to add more specific initialization logic,
   * ensuring they call `super.initialize()` if they override it.
   * @throws Error if the wallet client cannot be initialized.
   */
  async initialize(): Promise<void> {
    console.log(`[${this.name}] Address: ${this.address}`);

    this.initialized = true;
  }

  /**
   * Get the address of the claim issuer
   */
  get address(): Address {
    if (!this._address) {
      throw new Error('Address not initialized');
    }
    return this._address;
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

  async getIdentity(): Promise<`0x${string}`> {
    if (this._identityPromise) {
      return this._identityPromise;
    }

    this._identityPromise = new Promise((resolve, reject) => {
      // Internal function to create the identity
      const createIdentity = async (): Promise<`0x${string}`> => {
        const identityFactory = atkDeployer.getIdentityFactoryContract();
        const transactionHash = await withDecodedRevertReason(() =>
          identityFactory.write.createIdentity([this.address, []])
        );

        const { identity } = (await waitForEvent({
          transactionHash,
          contract: identityFactory,
          eventName: 'IdentityCreated',
        })) as { identity: `0x${string}` };

        this._identity = identity;
        console.log(`[${this.name}] identity: ${identity}`);

        return identity;
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
