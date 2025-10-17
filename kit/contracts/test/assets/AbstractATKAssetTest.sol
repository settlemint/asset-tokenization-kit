// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../utils/SystemUtils.sol";
import { TestConstants } from "../Constants.sol";
import { TokenUtils } from "../utils/TokenUtils.sol";
import { ClaimUtils } from "../utils/ClaimUtils.sol";
import { IdentityUtils } from "../utils/IdentityUtils.sol";
import { ATKTopics } from "../../contracts/system/ATKTopics.sol";
import { ATKAssetRoles } from "../../contracts/assets/ATKAssetRoles.sol";
import { ATKPeopleRoles } from "../../contracts/system/ATKPeopleRoles.sol";
import { ATKForwarder } from "../../contracts/vendor/ATKForwarder.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";

abstract contract AbstractATKAssetTest is Test {
    address public platformAdmin;
    address public claimIssuer;

    uint256 internal claimIssuerPrivateKey = 0x12345;

    SystemUtils internal systemUtils;
    TokenUtils internal tokenUtils;
    ClaimUtils internal claimUtils;
    IdentityUtils internal identityUtils;

    ATKForwarder public forwarder;

    function setUpATK(address _owner) public virtual {
        // --- Setup platform admin ---
        platformAdmin = makeAddr("Platform Admin");

        // --- Setup claim issuer ---
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // Set up utils
        systemUtils = new SystemUtils(platformAdmin);
        tokenUtils = new TokenUtils(
            platformAdmin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.compliance()
        );
        claimUtils = new ClaimUtils(
            platformAdmin,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );
        identityUtils = new IdentityUtils(
            platformAdmin,
            systemUtils.identityFactory(),
            systemUtils.identityRegistry(),
            systemUtils.trustedIssuersRegistry()
        );

        // Initialize the claim issuer and topic schemes
        uint256[] memory claimTopics = new uint256[](2);
        claimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        claimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);

        // Use claimIssuer address directly, createIssuerIdentity handles creating the on-chain identity
        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, claimTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");

        // Initialize the forwarder
        forwarder = new ATKForwarder();

        // Grant necessary roles to the owner in the system access manager
        vm.startPrank(platformAdmin);
        bytes32[] memory ownerRoles = new bytes32[](2);
        ownerRoles[0] = ATKPeopleRoles.TOKEN_MANAGER_ROLE;
        ownerRoles[1] = ATKPeopleRoles.ADDON_MANAGER_ROLE;
        systemUtils.systemAccessManager().grantMultipleRoles(_owner, ownerRoles);
        vm.stopPrank();
    }

    function _setUpIdentity(address _wallet, string memory _label) internal {
        vm.label(_wallet, _label);
        address identity = identityUtils.createClientIdentity(_wallet, TestConstants.COUNTRY_CODE_BE);
        vm.label(identity, string.concat(_label, " Identity"));
        claimUtils.issueInvestorClaim(_wallet, ATKTopics.TOPIC_INVESTOR_KYC, "Verified KYC by Issuer");
    }

    function _setUpIdentities(string[] memory _labels, address[] memory _wallets) internal {
        require(_labels.length == _wallets.length, "Labels and wallets arrays must have the same length");
        uint256 walletsLength = _wallets.length;
        for (uint256 i = 0; i < walletsLength; ++i) {
            _setUpIdentity(_wallets[i], _labels[i]);
        }
    }

    function _issueCollateralClaim(address _token, address _issuer, uint256 _amount, uint256 _expiry) internal {
        claimUtils.issueCollateralClaim(_token, _issuer, _amount, _expiry);
    }

    function _createIdentity(address _wallet) internal returns (address) {
        return identityUtils.createIdentity(_wallet);
    }

    function _createClaimUtilsForIssuer(address claimIssuer_, uint256 claimIssuerPrivateKey_)
        internal
        returns (ClaimUtils)
    {
        return new ClaimUtils(
            platformAdmin,
            claimIssuer_,
            claimIssuerPrivateKey_,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );
    }

    function _grantAllRoles(address accessManager, address wallet, address defaultAdmin) internal {
        vm.startPrank(defaultAdmin);
        ISMARTTokenAccessManager(accessManager).grantRole(ATKAssetRoles.GOVERNANCE_ROLE, wallet);
        ISMARTTokenAccessManager(accessManager).grantRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, wallet);
        ISMARTTokenAccessManager(accessManager).grantRole(ATKAssetRoles.CUSTODIAN_ROLE, wallet);
        ISMARTTokenAccessManager(accessManager).grantRole(ATKAssetRoles.EMERGENCY_ROLE, wallet);
        vm.stopPrank();
    }
}
