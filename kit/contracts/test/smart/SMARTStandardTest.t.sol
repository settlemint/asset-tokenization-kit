// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// This file now represents the test suite for the STANDARD token implementation.
// It inherits the common test logic and infrastructure setup.

import { SMARTCoreTest } from "./extensions/SMARTCoreTest.sol";
import { SMARTBurnableTest } from "./extensions/SMARTBurnableTest.sol";
import { SMARTPausableTest } from "./extensions/SMARTPausableTest.sol";
import { SMARTCustodianTest } from "./extensions/SMARTCustodianTest.sol";
import { SMARTCollateralTest } from "./extensions/SMARTCollateralTest.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { SMARTToken } from "./examples/SMARTToken.sol";
import { ATKTopics } from "../../contracts/system/ATKTopics.sol";
import { SMARTIdentityVerificationTest } from "./extensions/SMARTIdentityVerificationTest.sol";
import { SMARTCappedTest } from "./extensions/SMARTCappedTest.sol";
// Rename contract to reflect its purpose

contract SMARTStandardTest is
    SMARTCoreTest,
    SMARTBurnableTest,
    SMARTPausableTest,
    SMARTCustodianTest,
    SMARTCollateralTest,
    SMARTIdentityVerificationTest,
    SMARTCappedTest
{
    function _setupToken() internal override {
        // 1. Create the token contract
        vm.startPrank(tokenIssuer);
        SMARTToken bond = new SMARTToken(
            "Test Bond",
            "TSTB",
            18,
            DEFAULT_CAP,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            modulePairs,
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );
        address tokenAddress = address(bond);
        vm.stopPrank();

        _grantAllRoles(tokenAddress, tokenIssuer);

        // 2. Create the token's on-chain identity
        tokenUtils.createAndSetTokenOnchainID(tokenAddress, tokenIssuer);

        token = ISMART(tokenAddress);
    }
}
