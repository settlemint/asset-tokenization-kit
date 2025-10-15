import { formatEther, type Abi, type Address } from "viem";
import type { Actor } from "../../entities/actor";
import { atkDeployer } from "../../services/deployer";
import { getPublicClient } from "../../utils/public-client";
import { waitForEvent } from "../../utils/wait-for-event";

// Define the Flow struct type for XVP settlements
type FlowStruct = {
  asset: Address;
  from: Address;
  to: Address;
  amount: bigint;
  externalChainId: bigint;
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
  fromActor: Actor,
  toActor: Actor,
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
        externalChainId: 0n,
      },
      {
        asset: toAssetAddress,
        from: toActor.address,
        to: fromActor.address,
        amount: toAmount,
        externalChainId: 0n,
      },
    ];

    // Set cutoff date to 1 week from current blockchain time
    const publicClient = getPublicClient();
    const currentBlock = await publicClient.getBlock();
    const cutoffDate = Number(currentBlock.timestamp) + 7 * 24 * 3600; // 1 week from blockchain time

    const settlementName = `XVP ${fromActor.name} to ${toActor.name} - ${Date.now()}`;
    console.log(
      `Creating settlement with name: ${settlementName} and cutoff date: ${new Date(cutoffDate * 1000).toISOString()}`
    );

    // Create the settlement
    const zeroHashlock =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    const txHash = await xvpFactory.write.create([
      settlementName,
      flows,
      BigInt(cutoffDate),
      autoExecute,
      zeroHashlock,
    ]);

    console.log(`⏳ Settlement creation transaction sent: ${txHash}`);

    // Wait for the ATKXvPSettlementCreated event to get the settlement address
    const eventArgs = await waitForEvent({
      transactionHash: txHash,
      contract: xvpFactory,
      eventName: "ATKXvPSettlementCreated",
    });

    const typedEventArgs = eventArgs as { settlement: Address };

    if (!eventArgs || !typedEventArgs.settlement) {
      throw new Error(
        "Failed to extract settlement address from ATKXvPSettlementCreated event"
      );
    }

    const settlementAddress = typedEventArgs.settlement;

    console.log(`✅ XVP Settlement created at: ${settlementAddress}`);
    console.log(
      `⏰ Settlement expires at: ${new Date(cutoffDate * 1000).toISOString()}`
    );

    return settlementAddress;
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
  actor: Actor,
  assetAddress: Address,
  amount: bigint
): Promise<void> {
  console.log(`\n=== ${actor.name} Approving XVP Settlement ===`);
  console.log(`Settlement: ${settlementAddress}`);
  console.log(`Asset: ${assetAddress}`);
  console.log(`Amount: ${formatEther(amount)}`);

  try {
    // Get the ERC20 token contract
    const { ismartAbi } = await import("../../abi/ismart");
    const tokenContract = actor.getContractInstance({
      address: assetAddress,
      abi: ismartAbi,
    });

    console.log(`Approving ${formatEther(amount)} tokens for settlement...`);
    await tokenContract.write.approve([settlementAddress, amount]);

    console.log(`✅ Token approval successful`);

    // Get the XVP settlement contract
    const { xvpSettlementAbi } = await import("../../abi/xvpSettlement");
    const settlementContract = actor.getContractInstance({
      address: settlementAddress,
      abi: xvpSettlementAbi as Abi,
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

/**
 * Approves an XVP settlement without executing it
 * This function performs token approval and settlement approval but does not execute
 *
 * @param settlementAddress - Address of the XVP settlement contract
 * @param actor - The actor approving the settlement
 * @param assetAddress - Address of the asset to approve
 * @param amount - Amount to approve
 */
export async function approveXvpSettlement(
  settlementAddress: Address,
  actor: Actor,
  assetAddress: Address,
  amount: bigint
): Promise<void> {
  console.log(
    `\n=== ${actor.name} Approving XVP Settlement (No Execution) ===`
  );
  console.log(`Settlement: ${settlementAddress}`);
  console.log(`Asset: ${assetAddress}`);
  console.log(`Amount: ${formatEther(amount)}`);

  try {
    // Get the ERC20 token contract
    const { ismartAbi } = await import("../../abi/ismart");
    const tokenContract = actor.getContractInstance({
      address: assetAddress,
      abi: ismartAbi,
    });

    console.log(`Approving ${formatEther(amount)} tokens for settlement...`);
    await tokenContract.write.approve([settlementAddress, amount]);

    console.log(`✅ Token approval successful`);

    // Get the XVP settlement contract
    const { xvpSettlementAbi } = await import("../../abi/xvpSettlement");
    const settlementContract = actor.getContractInstance({
      address: settlementAddress,
      abi: xvpSettlementAbi as Abi,
    });

    console.log(`Approving settlement...`);
    await settlementContract.write.approve();

    console.log(`✅ Settlement approval successful (no execution)`);
  } catch (error) {
    console.error(
      `❌ Failed to approve XVP settlement for ${actor.name}:`,
      error
    );
    throw error;
  }
}
