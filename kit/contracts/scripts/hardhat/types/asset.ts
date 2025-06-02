import { Address } from "viem";

export class Asset {
  constructor(
    public readonly name: string,
    public readonly symbol: string,
    public readonly address: Address,
    public readonly identity: Address,
    public readonly accessManager: Address
  ) {
    console.log(`[Asset] ${name} (${symbol}) created`);
    console.log(`[Asset] ${name} address: ${address}`);
    console.log(`[Asset] ${name} identity: ${identity}`);
    console.log(`[Asset] ${name} access manager: ${accessManager}`);
  }
}
