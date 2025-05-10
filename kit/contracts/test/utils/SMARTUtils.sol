// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { InfrastructureUtils } from "smart-protocol/test/utils/InfrastructureUtils.sol";
import { TokenUtils } from "smart-protocol/test/utils/TokenUtils.sol";
import { ClaimUtils } from "smart-protocol/test/utils/ClaimUtils.sol";
import { IdentityUtils } from "smart-protocol/test/utils/IdentityUtils.sol";
import { SMARTIdentityRegistry } from "smart-protocol/contracts/SMARTIdentityRegistry.sol";
import { SMARTCompliance } from "smart-protocol/contracts/SMARTCompliance.sol";
import { TestConstants } from "../TestConstants.sol";
import { SMARTConstants } from "../../contracts/SMARTConstants.sol";

contract SMARTUtils is Test {
    address public platformAdmin;
    address public claimIssuer;

    uint256 internal claimIssuerPrivateKey = 0x12345;

    InfrastructureUtils internal infrastructureUtils;
    TokenUtils internal tokenUtils;
    ClaimUtils internal claimUtils;
    IdentityUtils internal identityUtils;

    constructor() {
        // --- Setup platform admin ---
        platformAdmin = makeAddr("Platform Admin");

        // --- Setup claim issuer ---
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // Set up utils
        infrastructureUtils = new InfrastructureUtils(platformAdmin);
        tokenUtils = new TokenUtils(
            platformAdmin,
            infrastructureUtils.identityFactory(),
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.compliance()
        );
        claimUtils = new ClaimUtils(
            platformAdmin,
            claimIssuer,
            claimIssuerPrivateKey,
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.identityFactory(),
            SMARTConstants.CLAIM_TOPIC_COLLATERAL,
            TestConstants.CLAIM_TOPIC_KYC,
            TestConstants.CLAIM_TOPIC_AML
        );
        identityUtils = new IdentityUtils(
            platformAdmin,
            infrastructureUtils.identityFactory(),
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.trustedIssuersRegistry()
        );

        // Initialize the claim issuer
        uint256[] memory claimTopics = new uint256[](2);
        claimTopics[0] = TestConstants.CLAIM_TOPIC_KYC;
        claimTopics[1] = SMARTConstants.CLAIM_TOPIC_COLLATERAL;
        // Use claimIssuer address directly, createIssuerIdentity handles creating the on-chain identity
        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, claimTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");
    }

    function identityRegistry() public view returns (SMARTIdentityRegistry) {
        return infrastructureUtils.identityRegistry();
    }

    function compliance() public view returns (SMARTCompliance) {
        return infrastructureUtils.compliance();
    }

    function setUpIdentity(address _wallet) public {
        identityUtils.createClientIdentity(_wallet, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueInvestorClaim(_wallet, TestConstants.CLAIM_TOPIC_KYC, "Verified KYC by Issuer");
    }

    function setUpIdentities(address[] memory _wallets) public {
        uint256 walletsLength = _wallets.length;
        for (uint256 i = 0; i < walletsLength; i++) {
            setUpIdentity(_wallets[i]);
        }
    }

    function createAndSetTokenOnchainID(address _token, address _issuer) public {
        tokenUtils.createAndSetTokenOnchainID(_token, _issuer);
    }

    function issueCollateralClaim(address _token, address _issuer, uint256 _amount, uint256 _expiry) public {
        claimUtils.issueCollateralClaim(_token, _issuer, _amount, _expiry);
    }

    function createIdentity(address _wallet) public returns (address) {
        return identityUtils.createIdentity(_wallet);
    }

    function createClaimUtilsForIssuer(
        address claimIssuer_,
        uint256 claimIssuerPrivateKey_
    )
        public
        returns (ClaimUtils)
    {
        return new ClaimUtils(
            platformAdmin,
            claimIssuer_,
            claimIssuerPrivateKey_,
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.identityFactory(),
            SMARTConstants.CLAIM_TOPIC_COLLATERAL,
            TestConstants.CLAIM_TOPIC_KYC,
            TestConstants.CLAIM_TOPIC_AML
        );
    }
}
