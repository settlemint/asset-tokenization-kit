import type { Address } from 'viem';
import { ATKContracts } from '../constants/contracts';
import { ATKTopic } from '../constants/topics';
import type { AbstractActor } from '../entities/actors/abstract-actor';
import { claimIssuer } from '../entities/actors/claim-issuer';
import { atkDeployer } from '../services/deployer';
import { topicManager } from '../services/topic-manager';
import { encodeClaimData } from '../utils/claim-scheme-utils';
import { waitForSuccess } from '../utils/wait-for-success';

export const issueVerificationClaims = async (actor: AbstractActor) => {
  console.log(
    '[Verification claims] → Starting verification claims issuance...'
  );

  const claimIssuerIdentity = await claimIssuer.getIdentity();

  // cannot do these in parallel, else we get issues with the nonce in addClaim
  await _issueClaim(
    actor,
    claimIssuerIdentity,
    ATKTopic.kyc,
    `KYC verified by ${claimIssuer.name} (${claimIssuerIdentity})`
  );
  await _issueClaim(
    actor,
    claimIssuerIdentity,
    ATKTopic.aml,
    `AML verified by ${claimIssuer.name} (${claimIssuerIdentity})`
  );

  const isVerified = await atkDeployer
    .getIdentityRegistryContract()
    .read.isVerified([
      actor.address,
      [
        topicManager.getTopicId(ATKTopic.kyc),
        topicManager.getTopicId(ATKTopic.aml),
      ],
    ]);

  if (!isVerified) {
    throw new Error('Identity is not verified');
  }

  console.log(
    `[Verification claims] ✓ Identity for ${actor.name} (${actor.address}) is verified`
  );
};

async function _issueClaim(
  actor: AbstractActor,
  claimIssuerIdentity: Address,
  claimTopic: ATKTopic,
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
    abi: ATKContracts.identity,
  });

  const transactionHash = await identityContract.write.addClaim([
    topicId,
    BigInt(1), // ECDSA
    claimIssuerIdentity,
    claimSignature,
    encodedClaimData,
    '',
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Verification claims] "${claimData}" issued for identity ${actor.name} (${identityAddress}).`
  );
}
