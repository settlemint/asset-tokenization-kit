import type { Address } from "viem";
import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";

export const getBalance = async (asset: Asset<any>, address: Address) => {
  console.log(`[GetBalance] → Starting get balance operation...`);

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const balance = await withDecodedRevertReason(() =>
    tokenContract.read.balanceOf([address])
  );

  const balanceExact = formatBaseUnits(balance, asset.decimals);

  console.log(
    `[GetBalance] ✓ ${address} has a balance of ${balanceExact} for token ${asset.name} (${asset.symbol})`
  );

  return balanceExact;
};
