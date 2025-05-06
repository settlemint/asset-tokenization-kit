// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { SMARTDeposit } from "../contracts/SMARTDeposit.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { SMARTConstants } from "../contracts/SMARTConstants.sol";
import { TestConstants } from "./TestConstants.sol";
import { InvalidDecimals } from "@smartprotocol/contracts/extensions/core/SMARTErrors.sol";

import { SMARTComplianceModuleParamPair } from
    "@smartprotocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { Unauthorized } from "@smartprotocol/contracts/extensions/common/CommonErrors.sol";
import { SMARTUtils } from "./utils/SMARTUtils.sol";
import { console } from "forge-std/console.sol";

contract SMARTDepositTest is Test {
    SMARTUtils internal smartUtils;

    address public owner;
    address public user1;
    address public user2;

    address public identityRegistry;
    address public compliance;

    SMARTDeposit public deposit;
    Forwarder public forwarder;

    uint8 public constant DECIMALS = 8;

    function setUp() public {
        smartUtils = new SMARTUtils();
        identityRegistry = address(smartUtils.identityRegistry());
        compliance = address(smartUtils.compliance());

        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Initialize identities
        address[] memory identities = new address[](3);
        identities[0] = owner;
        identities[1] = user1;
        identities[2] = user2;
        smartUtils.setUpIdentities(identities);

        // Create forwarder first
        forwarder = new Forwarder();

        deposit =
            _createDeposit("Deposit", "DEP", DECIMALS, new uint256[](0), new SMARTComplianceModuleParamPair[](0), owner);
    }

    function _createDeposit(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256[] memory requiredClaimTopics,
        SMARTComplianceModuleParamPair[] memory initialModulePairs,
        address owner_
    )
        internal
        returns (SMARTDeposit)
    {
        vm.startPrank(owner_);
        SMARTDeposit deposit_ = new SMARTDeposit(
            name,
            symbol,
            decimals,
            address(0),
            requiredClaimTopics,
            initialModulePairs,
            identityRegistry,
            compliance,
            owner_,
            address(forwarder)
        );
        vm.stopPrank();

        smartUtils.createAndSetTokenOnchainID(address(deposit_), owner_);

        return deposit_;
    }
}
