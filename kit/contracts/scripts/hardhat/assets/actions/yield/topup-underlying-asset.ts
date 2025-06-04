import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForEvent } from "../../../utils/wait-for-event";
import { approve } from "../core/approve";
import { mint } from "../core/mint";

export const topupUnderlyingAsset = async (
  asset: Asset<any>,
  underlyingAsset: Asset<any>,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  await mint(underlyingAsset, owner, amount);
  await approve(underlyingAsset, scheduleAddress, amount);

  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: SMARTContracts.ismartFixedYieldSchedule,
  });

  const topUpAmount = toDecimals(amount, underlyingAsset.decimals);

  const topUpTransactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.topUpUnderlyingAsset([topUpAmount])
  );
  await waitForEvent({
    transactionHash: topUpTransactionHash,
    contract: scheduleContract,
    eventName: "UnderlyingAssetTopUp",
  });

  console.log(
    `[Topup underlying asset] ${asset.symbol} underlying asset topped up with amount ${amount}.`
  );
};
