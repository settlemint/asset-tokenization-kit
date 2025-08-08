import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForEvent } from "../../../utils/wait-for-event";
import { approve } from "../core/approve";
import { mint } from "../core/mint";

export const topupDenominationAsset = async (
  asset: Asset<any>,
  denominationAsset: Asset<any>,
  amount: bigint
) => {
  console.log(
    `[Topup denomination asset] → Starting denomination asset topup...`
  );

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  await mint(denominationAsset, owner, amount);
  await approve(denominationAsset, scheduleAddress, amount);

  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: ATKContracts.ismartFixedYieldSchedule,
  });

  const topUpAmount = toBaseUnits(amount, denominationAsset.decimals);

  const topUpTransactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.topUpDenominationAsset([topUpAmount])
  );
  await waitForEvent({
    transactionHash: topUpTransactionHash,
    contract: scheduleContract,
    eventName: "DenominationAssetTopUp",
  });

  console.log(
    `[Topup denomination asset] ✓ ${asset.symbol} denomination asset topped up with ${formatBaseUnits(topUpAmount, denominationAsset.decimals)} ${denominationAsset.symbol}`
  );
};
