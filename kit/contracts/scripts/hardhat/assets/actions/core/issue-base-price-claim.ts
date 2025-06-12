import {
  ATK_BASE_CURRENCY_CODE,
  ATK_BASE_CURRENCY_DECIMALS,
} from "../../../constants/base-currency";
import { ATKContracts } from "../../../constants/contracts";
import { ATKTopic } from "../../../constants/topics";
import { claimIssuer } from "../../../entities/actors/claim-issuer";
import { owner } from "../../../entities/actors/owner";
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
    abi: ATKContracts.tokenIdentity,
  });

  const claimIssuerIdentity = await claimIssuer.getIdentity();

  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      BigInt(1), // ECDSA
      claimIssuerIdentity,
      basePriceClaimSignature,
      basePriceClaimData,
      "",
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Base price claim] issued for token identity ${asset.name} (${asset.identity}) with base price ${formatBaseUnits(amountBigInt, ATK_BASE_CURRENCY_DECIMALS)} ${ATK_BASE_CURRENCY_CODE}.`
  );
};
