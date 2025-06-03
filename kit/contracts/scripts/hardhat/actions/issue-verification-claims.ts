import type { Address } from "viem";
import type { AbstractActor } from "../actors/abstract-actor";
import { claimIssuer } from "../actors/claim-issuer";
import { SMARTContracts } from "../constants/contracts";

import { SMARTTopic } from "../constants/topics";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { encodeClaimData } from "../utils/claim-scheme-utils";
import { waitForSuccess } from "../utils/wait-for-success";

export const issueVerificationClaims = async (actor: AbstractActor) => {
  const claimIssuerIdentity = await claimIssuer.getIdentity();

  // cannot do these in parallel, else we get issues with the nonce in addClaim
  await _issueClaim(
    actor,
    claimIssuerIdentity,
    SMARTTopic.kyc,
    `KYC verified by ${claimIssuer.name} (${claimIssuerIdentity})`
  );
  await _issueClaim(
    actor,
    claimIssuerIdentity,
    SMARTTopic.aml,
    `AML verified by ${claimIssuer.name} (${claimIssuerIdentity})`
  );

  const isVerified = await smartProtocolDeployer
    .getIdentityRegistryContract()
    .read.isVerified([
      actor.address,
      [
        topicManager.getTopicId(SMARTTopic.kyc),
        topicManager.getTopicId(SMARTTopic.aml),
      ],
    ]);

  if (!isVerified) {
    throw new Error("Identity is not verified");
  }

  console.log(
    `[Verification claims] identity for ${actor.name} (${actor.address}) is verified.`
  );
};

async function _issueClaim(
  actor: AbstractActor,
  claimIssuerIdentity: Address,
  claimTopic: SMARTTopic,
  claimData: string
) {
  const encodedClaimData = encodeClaimData(claimTopic, [claimData]);

  const identityAddress = await actor.getIdentity();

  const { signature: claimSignature, topicId } = await claimIssuer.createClaim(
    identityAddress,
    claimTopic,
    encodedClaimData
  );

  const identityContract = actor.getContractInstance({
    address: identityAddress,
    abi: SMARTContracts.identity,
  });

  const transactionHash = await identityContract.write.addClaim([
    topicId,
    BigInt(1), // ECDSA
    claimIssuerIdentity,
    claimSignature,
    encodedClaimData,
    "",
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Verification claims] "${claimData}" issued for identity ${actor.name} (${identityAddress}).`
  );
}
