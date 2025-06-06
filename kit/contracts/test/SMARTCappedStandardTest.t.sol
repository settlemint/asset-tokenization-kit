// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// This file represents the test suite for the SMART Capped token implementation.
// It inherits the common test logic and infrastructure setup.

import { SMARTCappedTest } from "./extensions/SMARTCappedTest.sol";
import { ISMART } from "../contracts/interface/ISMART.sol";
import { SMARTCappedToken } from "./examples/SMARTCappedToken.sol";
import { SMARTTopics } from "../contracts/system/SMARTTopics.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { SMARTSystemRoles } from "../contracts/system/SMARTSystemRoles.sol";

contract SMARTCappedStandardTest is SMARTCappedTest {
    function _setupToken() internal override {
        // 1. Create the capped token contract
        vm.startPrank(tokenIssuer);
        SMARTCappedToken cappedToken = new SMARTCappedToken(
            "Test Capped Token",
            "TCAP",
            18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            modulePairs,
            systemUtils.topicSchemeRegistry().getTopicId(SMARTTopics.TOPIC_COLLATERAL),
            address(accessManager),
            DEFAULT_CAP
        );
        address tokenAddress = address(cappedToken);
        vm.stopPrank();

        // Grant roles using the same pattern as SMARTStandardTest
        vm.startPrank(tokenIssuer);
        // Grant all roles to the token issuer
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).TOKEN_ADMIN_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).COMPLIANCE_ADMIN_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).VERIFICATION_ADMIN_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).MINTER_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).BURNER_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).FREEZER_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).FORCED_TRANSFER_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).RECOVERY_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTCappedToken(tokenAddress).PAUSER_ROLE(), tokenIssuer);
        IAccessControl(accessManager).grantRole(SMARTSystemRoles.CLAIM_MANAGER_ROLE, tokenIssuer);
        vm.stopPrank();

        // 2. Create the token's on-chain identity
        tokenUtils.createAndSetTokenOnchainID(tokenAddress, tokenIssuer, address(accessManager));

        // 3. Set token in AbstractSMARTTest
        token = ISMART(tokenAddress);
    }
}
