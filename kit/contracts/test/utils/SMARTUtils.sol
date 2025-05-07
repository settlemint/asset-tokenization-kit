// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { InfrastructureUtils } from "@smartprotocol/tests/utils/InfrastructureUtils.sol";
import { TokenUtils } from "@smartprotocol/tests/utils/TokenUtils.sol";
import { ClaimUtils } from "@smartprotocol/tests/utils/ClaimUtils.sol";
import { IdentityUtils } from "@smartprotocol/tests/utils/IdentityUtils.sol";
import { SMARTIdentityRegistry } from "@smartprotocol/contracts/SMARTIdentityRegistry.sol";
import { SMARTCompliance } from "@smartprotocol/contracts/SMARTCompliance.sol";

import { SMARTConstants } from "../../contracts/SMARTConstants.sol";
import { TestConstants } from "./../TestConstants.sol";

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
            infrastructureUtils.identityFactory()
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
        for (uint256 i = 0; i < _wallets.length; i++) {
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
            infrastructureUtils.identityFactory()
        );
    }
}
