import type { SessionUser } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getVerificationId } from "@/orpc/helpers/get-verification-id";
import { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";
import {
  Address,
  encodeAbiParameters,
  encodePacked,
  isHex,
  keccak256,
  parseAbiParameters,
} from "viem";

/**
 * GraphQL mutation for signing a message with a wallet.
 */
const SIGN_MESSAGE_MUTATION = portalGraphql(`
  mutation SignMessage($address: String!, $data: String!, $challengeId: String!, $challengeResponse: String!) {
    walletSignMessage(userWalletAddress: $address, data: $data, challengeId: $challengeId, challengeResponse: $challengeResponse) {
      signature
    }
  }
`);

/**
 * Input parameters for creating a claim.
 */
export interface CreateClaimInput {
  /**
   * Wallet address of the issuer of the claim
   */
  user: SessionUser;
  /**
   * Wallet verification of the user
   */
  walletVerification: UserVerification;
  /**
   * Identity to issue the claim to
   */
  identity: Address;
  /**
   * Claim info
   */
  claim: ClaimInfo;
}

/**
 * Enum of supported claim topics.
 */
export enum ClaimTopic {
  // Investor-level
  kyc = "knowYourCustomer",
  aml = "antiMoneyLaundering",
  qii = "qualifiedInstitutionalInvestor",
  professionalInvestor = "professionalInvestor",
  accreditedInvestor = "accreditedInvestor",
  accreditedInvestorVerified = "accreditedInvestorVerified",
  regS = "regulationS",

  // Issuer-level
  issuerProspectusFiled = "issuerProspectusFiled",
  issuerProspectusExempt = "issuerProspectusExempt",
  issuerLicensed = "issuerLicensed",
  issuerReportingCompliant = "issuerReportingCompliant",
  issuerJurisdiction = "issuerJurisdiction",

  // Asset-level
  collateral = "collateral",
  isin = "isin",
  assetClassification = "assetClassification",
  basePrice = "basePrice",
  assetIssuer = "assetIssuer",

  // General
  contractIdentity = "contractIdentity",
}

/**
 * Union type for all supported claim info types.
 */
export type ClaimInfo =
  | AssetClassificationClaim
  | AssetIssuerClaim
  | BasePriceClaim
  | CollateralClaim
  | ContractIdentityClaim
  | GenericClaim
  | IsinClaim
  | IssuerJurisdictionClaim
  | IssuerLicensedClaim
  | IssuerProspectusExemptClaim
  | IssuerProspectusFiledClaim
  | IssuerReportingCompliantClaim;

/**
 * Asset classification claim structure.
 */
export interface AssetClassificationClaim {
  topic: ClaimTopic.assetClassification;
  data: {
    class: string;
    category: string;
  };
}

/**
 * Asset issuer claim structure.
 */
export interface AssetIssuerClaim {
  topic: ClaimTopic.assetIssuer;
  data: {
    issuerAddress: Address;
  };
}

/**
 * Base price claim structure.
 */
export interface BasePriceClaim {
  topic: ClaimTopic.basePrice;
  data: {
    amount: bigint;
    currencyCode: string;
    decimals: number;
  };
}

/**
 * Collateral claim structure.
 */
export interface CollateralClaim {
  topic: ClaimTopic.collateral;
  data: {
    amount: bigint;
    expiryTimestamp: bigint;
  };
}

/**
 * Contract identity claim structure.
 */
export interface ContractIdentityClaim {
  topic: ClaimTopic.contractIdentity;
  data: {
    contractAddress: Address;
  };
}

/**
 * Generic claim structure for investor-level topics.
 */
export interface GenericClaim {
  topic:
    | ClaimTopic.kyc
    | ClaimTopic.aml
    | ClaimTopic.qii
    | ClaimTopic.professionalInvestor
    | ClaimTopic.accreditedInvestor
    | ClaimTopic.accreditedInvestorVerified
    | ClaimTopic.regS;
  data: {
    claim: string;
  };
}

/**
 * ISIN claim structure.
 */
export interface IsinClaim {
  topic: ClaimTopic.isin;
  data: {
    isin: string;
  };
}

/**
 * Issuer jurisdiction claim structure.
 */
export interface IssuerJurisdictionClaim {
  topic: ClaimTopic.issuerJurisdiction;
  data: {
    jurisdiction: string;
  };
}

/**
 * Issuer licensed claim structure.
 */
export interface IssuerLicensedClaim {
  topic: ClaimTopic.issuerLicensed;
  data: {
    licenseType: string;
    licenseNumber: string;
    jurisdiction: string;
    validUntil: bigint;
  };
}

/**
 * Issuer prospectus exempt claim structure.
 */
export interface IssuerProspectusExemptClaim {
  topic: ClaimTopic.issuerProspectusExempt;
  data: {
    exemptionReference: string;
  };
}

/**
 * Issuer prospectus filed claim structure.
 */
export interface IssuerProspectusFiledClaim {
  topic: ClaimTopic.issuerProspectusFiled;
  data: {
    prospectusReference: string;
  };
}

/**
 * Issuer reporting compliant claim structure.
 */
export interface IssuerReportingCompliantClaim {
  topic: ClaimTopic.issuerReportingCompliant;
  data: {
    compliant: boolean;
    lastUpdated: bigint;
  };
}

/**
 * Generates a signed claim for a user and identity.
 *
 * @param params - The claim creation parameters, including user, wallet verification, identity address, and claim details.
 * @returns An object containing the encoded claim data, signature, and topic ID.
 * @throws {Error} If verification ID is not found or signature is invalid.
 */
export async function createClaim({
  user,
  walletVerification,
  identity,
  claim,
}: CreateClaimInput) {
  const topicId = BigInt(keccak256(encodePacked(["string"], [claim.topic])));
  const verificationId = getVerificationId(
    user,
    walletVerification.verificationType
  );
  if (!verificationId) {
    throw new Error("Verification ID not found");
  }

  const verificationOptions = await handleWalletVerificationChallenge({
    portalClient,
    portalGraphql,
    userWalletAddress: user.wallet,
    verificationId,
    verificationType: walletVerification.verificationType,
    code: walletVerification.secretVerificationCode,
  });

  const claimData = encodeClaimData(claim);
  const dataToSign = encodeAbiParameters(
    parseAbiParameters(
      "address subject, uint256 topicValue, bytes memory dataBytes"
    ),
    [identity, topicId, claimData]
  );
  const dataHash = keccak256(dataToSign);
  const response = await portalClient.request(SIGN_MESSAGE_MUTATION, {
    address: user.wallet,
    data: dataHash,
    challengeId: verificationOptions.challengeId,
    challengeResponse: verificationOptions.challengeResponse,
  });

  if (!isHex(response.walletSignMessage?.signature)) {
    throw new Error("Signature is not a valid hex string");
  }

  return {
    claimData,
    signature: response.walletSignMessage.signature,
    topicId,
  };
}

/**
 * Encodes claim data into ABI-encoded bytes based on the claim topic.
 *
 * @param claim - The claim information to encode.
 * @returns The ABI-encoded claim data as a byte string.
 * @throws {Error} If the claim topic is invalid or unsupported.
 */
function encodeClaimData(claim: ClaimInfo) {
  if (
    claim.topic === ClaimTopic.accreditedInvestor ||
    claim.topic === ClaimTopic.accreditedInvestorVerified ||
    claim.topic === ClaimTopic.aml ||
    claim.topic === ClaimTopic.kyc ||
    claim.topic === ClaimTopic.professionalInvestor ||
    claim.topic === ClaimTopic.qii ||
    claim.topic === ClaimTopic.regS
  ) {
    return encodeAbiParameters(
      [{ type: "string", name: "claim" }],
      [claim.data.claim]
    );
  }
  if (claim.topic === ClaimTopic.assetClassification) {
    return encodeAbiParameters(
      [
        { type: "string", name: "class" },
        { type: "string", name: "category" },
      ],
      [claim.data.class, claim.data.category]
    );
  }
  if (claim.topic === ClaimTopic.assetIssuer) {
    return encodeAbiParameters(
      [{ type: "address", name: "issuerAddress" }],
      [claim.data.issuerAddress]
    );
  }
  if (claim.topic === ClaimTopic.basePrice) {
    return encodeAbiParameters(
      [
        { type: "uint256", name: "amount" },
        { type: "string", name: "currencyCode" },
        { type: "uint8", name: "decimals" },
      ],
      [claim.data.amount, claim.data.currencyCode, claim.data.decimals]
    );
  }
  if (claim.topic === ClaimTopic.collateral) {
    return encodeAbiParameters(
      [
        { type: "uint256", name: "amount" },
        { type: "uint256", name: "expiryTimestamp" },
      ],
      [claim.data.amount, claim.data.expiryTimestamp]
    );
  }
  if (claim.topic === ClaimTopic.contractIdentity) {
    return encodeAbiParameters(
      [{ type: "address", name: "contractAddress" }],
      [claim.data.contractAddress]
    );
  }
  if (claim.topic === ClaimTopic.isin) {
    return encodeAbiParameters(
      [{ type: "string", name: "isin" }],
      [claim.data.isin]
    );
  }
  if (claim.topic === ClaimTopic.issuerJurisdiction) {
    return encodeAbiParameters(
      [{ type: "string", name: "jurisdiction" }],
      [claim.data.jurisdiction]
    );
  }
  if (claim.topic === ClaimTopic.issuerLicensed) {
    return encodeAbiParameters(
      [
        { type: "string", name: "licenseType" },
        { type: "string", name: "licenseNumber" },
        { type: "string", name: "jurisdiction" },
        { type: "uint256", name: "validUntil" },
      ],
      [
        claim.data.licenseType,
        claim.data.licenseNumber,
        claim.data.jurisdiction,
        claim.data.validUntil,
      ]
    );
  }
  if (claim.topic === ClaimTopic.issuerProspectusExempt) {
    return encodeAbiParameters(
      [{ type: "string", name: "exemptionReference" }],
      [claim.data.exemptionReference]
    );
  }
  if (claim.topic === ClaimTopic.issuerProspectusFiled) {
    return encodeAbiParameters(
      [{ type: "string", name: "prospectusReference" }],
      [claim.data.prospectusReference]
    );
  }
  if (claim.topic === ClaimTopic.issuerReportingCompliant) {
    return encodeAbiParameters(
      [
        { type: "bool", name: "compliant" },
        { type: "uint256", name: "lastUpdated" },
      ],
      [claim.data.compliant, claim.data.lastUpdated]
    );
  }
  throw new Error("Invalid claim topic");
}
