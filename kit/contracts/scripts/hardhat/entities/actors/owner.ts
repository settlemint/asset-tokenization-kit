import hre from 'hardhat';
import type { Chain, Transport, WalletClient } from 'viem';
import type { Account } from 'viem/accounts';
import { Countries } from '../../constants/countries';
import { AbstractActor } from './abstract-actor';

class Owner extends AbstractActor {
  private walletClient: WalletClient<Transport, Chain, Account> | null = null;

  constructor() {
    super('Owner', Countries.BE);
  }

  public async initialize(): Promise<void> {
    const [defaultSigner] = await hre.viem.getWalletClients();
    if (!defaultSigner) {
      throw new Error('Could not get a default wallet client from Hardhat.');
    }
    this.walletClient = defaultSigner;
    this._address = defaultSigner.account.address;

    await super.initialize();
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
      throw new Error('Wallet client not initialized');
    }

    return this.walletClient;
  }
}

export const owner = new Owner();
