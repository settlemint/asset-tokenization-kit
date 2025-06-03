// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SMARTCoreTest } from "./extensions/SMARTCoreTest.sol";
import { SMARTBurnableTest } from "./extensions/SMARTBurnableTest.sol";
import { SMARTPausableTest } from "./extensions/SMARTPausableTest.sol";
import { SMARTCustodianTest } from "./extensions/SMARTCustodianTest.sol";
import { SMARTCollateralTest } from "./extensions/SMARTCollateralTest.sol";
import { SMARTCountryAllowListTest } from "./extensions/SMARTCountryAllowListTest.sol";
import { SMARTCountryBlockListTest } from "./extensions/SMARTCountryBlockListTest.sol";
import { ISMART } from "../contracts/interface/ISMART.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { SMARTTokenUpgradeable } from "./examples/SMARTTokenUpgradeable.sol";
import { SMARTTopics } from "../contracts/system/SMARTTopics.sol";

// Contract for testing the UPGRADEABLE SMART token implementation

contract SMARTUpgradeableTest is
    SMARTCoreTest,
    SMARTBurnableTest,
    SMARTPausableTest,
    SMARTCustodianTest,
    SMARTCollateralTest,
    SMARTCountryAllowListTest,
    SMARTCountryBlockListTest
{
    function _setupToken() internal override {
        // 1. Deploy the implementation contract (no constructor args for upgradeable)
        vm.startPrank(tokenIssuer);
        SMARTTokenUpgradeable implementation = new SMARTTokenUpgradeable();

        // 2. Encode the initializer call data
        bytes memory initializeData = abi.encodeWithSelector(
            implementation.initialize.selector,
            "Test Bond",
            "TSTB",
            18, // Standard decimals
            address(0), // onchainID will be set by _createAndSetTokenOnchainID via proxy
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            requiredClaimTopics,
            modulePairs,
            systemUtils.topicSchemeRegistry().getTopicId(SMARTTopics.TOPIC_COLLATERAL),
            address(accessManager)
        );

        // 3. Deploy the ERC1967Proxy pointing to the implementation and initializing it
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initializeData);
        address tokenProxyAddress = address(proxy);
        vm.stopPrank();

        _grantAllRoles(tokenProxyAddress, tokenIssuer);

        // 4. Create the token's on-chain identity (using platform admin)
        tokenUtils.createAndSetTokenOnchainID(tokenProxyAddress, tokenIssuer, address(accessManager));

        token = ISMART(tokenProxyAddress);
    }
}
