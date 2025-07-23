import { claimIssuer, owner } from "../../../constants/actors";
import {
  ATK_BASE_CURRENCY_CODE,
  ATK_BASE_CURRENCY_DECIMALS,
} from "../../../constants/base-currency";
import { ATKContracts } from "../../../constants/contracts";
import { KeyType } from "../../../constants/key-types";
import { ATKTopic } from "../../../constants/topics";
import type { Asset } from "../../../entities/asset";
import { encodeClaimData } from "../../../utils/claim-scheme-utils";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const issueBasePriceClaim = async (
  asset: Asset<any>,
  amount: number | bigint
) => {
  console.log(`[Base price claim] → Starting claim issuance...`);

  const amountBigInt = toBaseUnits(amount, ATK_BASE_CURRENCY_DECIMALS);

  const encodedBasePriceData = encodeClaimData(ATKTopic.basePrice, [
    amountBigInt,
    ATK_BASE_CURRENCY_CODE,
    ATK_BASE_CURRENCY_DECIMALS,
  ]);

  const {
    data: basePriceClaimData,
    signature: basePriceClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    asset.identity,
    ATKTopic.basePrice,
    encodedBasePriceData
  );

  const tokenIdentityContract = owner.getContractInstance({
    address: asset.identity,
    abi: ATKContracts.contractIdentity,
  });

  const claimIssuerIdentity = await claimIssuer.getIdentity();

  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      KeyType.ecdsa,
      claimIssuerIdentity,
      basePriceClaimSignature,
      basePriceClaimData,
      "",
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Base price claim] ✓ Claim issued for token identity ${asset.name} (${asset.identity}) with base price ${formatBaseUnits(amountBigInt, ATK_BASE_CURRENCY_DECIMALS)} ${ATK_BASE_CURRENCY_CODE}`
  );
};
