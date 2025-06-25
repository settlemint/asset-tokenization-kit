import { Address, isAddress as isAddressViem } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const mint = async (
  asset: Asset<any>,
  to: AbstractActor | Asset<any> | Address,
  amount: bigint
) => {
  console.log(`[Mint] → Starting mint operation...`);

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.mint([isAddress(to) ? to : to.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Mint] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens minted to ${isAddress(to) ? to : `${to.name} (${to.address})`}`
  );
};

function isAddress(address: unknown): address is Address {
  return typeof address === "string" && isAddressViem(address);
}
