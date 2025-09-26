import type { Address } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import type { Actor } from "../../../entities/actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const forcedRecoverTokens = async (
  asset: Asset<any>,
  custodian: Actor,
  newWallet: Actor,
  lostWallet: Address
) => {
  console.log(`[Forced recover tokens] → Starting forced token recovery...`);

  const custodianContract = custodian.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCustodian,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    custodianContract.write.forcedRecoverTokens([lostWallet, newWallet.address])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Forced recover tokens] ✓ ${custodian.name} (${custodian.address}) recovered ${asset.name} (${asset.address}) tokens from ${lostWallet}`
  );
};
