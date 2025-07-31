import { claimIssuer } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { KeyType } from "../../../constants/key-types";
import { ATKTopic } from "../../../constants/topics";
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

  const claimIssuerIdentity = await claimIssuer.getIdentity();
  const tokenIdentityContract = claimIssuer.getContractInstance({
    address: asset.identity,
    abi: ATKContracts.contractIdentity,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      KeyType.ecdsa,
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
