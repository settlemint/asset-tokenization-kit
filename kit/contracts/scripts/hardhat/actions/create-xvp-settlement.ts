import { formatEther, type Address } from "viem";
import type { AbstractActor } from "../entities/actors/abstract-actor";
import { atkDeployer } from "../services/deployer";

// Define the Flow struct type for XVP settlements
type FlowStruct = {
  asset: Address;
  from: Address;
  to: Address;
  amount: bigint;
};

/**
 * Creates an XVP (Exchange-versus-Payment) settlement between two actors
 * This enables atomic swaps of tokens between parties
 *
 * @param fromActor - The actor offering tokens
 * @param toActor - The actor receiving tokens
 * @param fromAssetAddress - Address of the asset being offered
 * @param toAssetAddress - Address of the asset being requested
 * @param fromAmount - Amount being offered (in token units)
 * @param toAmount - Amount being requested (in token units)
 * @param autoExecute - Whether to auto-execute when all approvals are received
 * @returns The created XVP settlement contract address
 */
export async function createXvpSettlement(
  fromActor: AbstractActor,
  toActor: AbstractActor,
  fromAssetAddress: Address,
  toAssetAddress: Address,
  fromAmount: bigint,
  toAmount: bigint,
  autoExecute: boolean = false
): Promise<Address> {
  console.log(`\n=== Creating XVP Settlement ===`);
  console.log(`From: ${fromActor.name} (${fromActor.address})`);
  console.log(`To: ${toActor.name} (${toActor.address})`);
  console.log(
    `Offering: ${formatEther(fromAmount)} tokens from ${fromAssetAddress}`
  );
  console.log(
    `Requesting: ${formatEther(toAmount)} tokens from ${toAssetAddress}`
  );
  console.log(`Auto-execute: ${autoExecute}`);

  try {
    // Get the XVP settlement factory
    const xvpFactory = atkDeployer.getXvpSettlementFactoryContract(
      fromActor.getWalletClient()
    );

    // Create flows for the settlement
    const flows: FlowStruct[] = [
      {
        asset: fromAssetAddress,
        from: fromActor.address,
        to: toActor.address,
        amount: fromAmount,
      },
      {
        asset: toAssetAddress,
        from: toActor.address,
        to: fromActor.address,
        amount: toAmount,
      },
    ];

    // Set cutoff date to 1 hour from now
    const cutoffDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    console.log(
      `Creating settlement with cutoff date: ${new Date(cutoffDate * 1000).toISOString()}`
    );

    // Create the settlement
    const settlementAddress = await xvpFactory.write.create([
      flows,
      BigInt(cutoffDate),
      autoExecute,
    ]);

    console.log(`✅ XVP Settlement created at: ${settlementAddress}`);
    console.log(
      `⏰ Settlement expires at: ${new Date(cutoffDate * 1000).toISOString()}`
    );

    return settlementAddress as Address;
  } catch (error) {
    console.error("❌ Failed to create XVP settlement:", error);
    throw error;
  }
}

/**
 * Approves and executes an XVP settlement
 *
 * @param settlementAddress - Address of the XVP settlement contract
 * @param actor - The actor approving the settlement
 * @param assetAddress - Address of the asset to approve
 * @param amount - Amount to approve
 */
export async function approveAndExecuteXvpSettlement(
  settlementAddress: Address,
  actor: AbstractActor,
  assetAddress: Address,
  amount: bigint
): Promise<void> {
  console.log(`\n=== ${actor.name} Approving XVP Settlement ===`);
  console.log(`Settlement: ${settlementAddress}`);
  console.log(`Asset: ${assetAddress}`);
  console.log(`Amount: ${formatEther(amount)}`);

  try {
    // Get the ERC20 token contract
    const { ismartAbi } = await import("../abi/ismart");
    const tokenContract = actor.getContractInstance({
      address: assetAddress,
      abi: ismartAbi,
    });

    console.log(`Approving ${formatEther(amount)} tokens for settlement...`);
    await tokenContract.write.approve([settlementAddress, amount]);

    console.log(`✅ Token approval successful`);

    // Get the XVP settlement contract
    const { xvpSettlementAbi } = await import("../abi/xvpSettlement");
    const settlementContract = actor.getContractInstance({
      address: settlementAddress,
      abi: xvpSettlementAbi,
    });

    console.log(`Approving settlement...`);
    await settlementContract.write.approve();

    console.log(`✅ Settlement approval successful`);

    // Check if settlement is fully approved and can be executed
    const isFullyApproved = await settlementContract.read.isFullyApproved();

    if (isFullyApproved) {
      console.log(`🎯 Settlement is fully approved - executing...`);
      await settlementContract.write.execute();
      console.log(`✅ Settlement executed successfully!`);
    } else {
      console.log(
        `⏳ Settlement approved by ${actor.name}, waiting for other parties...`
      );
    }
  } catch (error) {
    console.error(
      `❌ Failed to approve/execute XVP settlement for ${actor.name}:`,
      error
    );
    throw error;
  }
}
