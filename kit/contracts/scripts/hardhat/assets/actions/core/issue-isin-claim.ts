import { SMARTContracts } from "../../../constants/contracts";
import { SMARTTopic } from "../../../constants/topics";
import { claimIssuer } from "../../../entities/actors/claim-issuer";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { encodeClaimData } from "../../../utils/claim-scheme-utils";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const issueIsinClaim = async (asset: Asset<any>, isin: string) => {
  const encodedIsinData = encodeClaimData(SMARTTopic.isin, [isin]);

  const {
    data: isinClaimData,
    signature: isinClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    asset.identity,
    SMARTTopic.isin,
    encodedIsinData
  );

  const tokenIdentityContract = owner.getContractInstance({
    address: asset.identity,
    abi: SMARTContracts.tokenIdentity,
  });

  const claimIssuerIdentity = await claimIssuer.getIdentity();

  const transactionHash = await tokenIdentityContract.write.addClaim([
    topicId,
    BigInt(1), // ECDSA
    claimIssuerIdentity,
    isinClaimSignature,
    isinClaimData,
    "",
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[ISIN claim] issued for token identity ${asset.name} (${asset.identity}) with ISIN ${isin}.`
  );
};
