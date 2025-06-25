import { ATKContracts } from "../../../constants/contracts";
import { ATKTopic } from "../../../constants/topics";
import { claimIssuer } from "../../../entities/actors/claim-issuer";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { encodeClaimData } from "../../../utils/claim-scheme-utils";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const issueIsinClaim = async (asset: Asset<any>, isin: string) => {
  console.log(`[ISIN claim] → Starting claim issuance...`);
  
  const encodedIsinData = encodeClaimData(ATKTopic.isin, [isin]);

  const {
    data: isinClaimData,
    signature: isinClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    asset.identity,
    ATKTopic.isin,
    encodedIsinData
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
      isinClaimSignature,
      isinClaimData,
      "",
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[ISIN claim] ✓ Claim issued for token identity ${asset.name} (${asset.identity}) with ISIN ${isin}`
  );
};
