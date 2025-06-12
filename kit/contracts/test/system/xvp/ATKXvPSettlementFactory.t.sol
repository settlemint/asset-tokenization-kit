// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { ATKXvPSettlementFactory } from "../../../contracts/system/xvp/ATKXvPSettlementFactory.sol";
import { XvPSettlement } from "../../../contracts/system/xvp/ATKXvPSettlement.sol";
import { ATKForwarder } from "../../../contracts/vendor/ATKForwarder.sol";
import { ERC20Mock } from "../../mocks/ERC20Mock.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract ATKXvPSettlementFactoryTest is Test {
    ATKXvPSettlementFactory public factory;
    ATKForwarder public forwarder;
    address public admin;
    address public alice;
    address public bob;
    ERC20Mock public tokenA;
    ERC20Mock public tokenB;

    function setUp() public {
        admin = makeAddr("admin");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        // Deploy mock tokens for testing flows
        tokenA = new ERC20Mock("Token A", "TKNA", 18);
        tokenB = new ERC20Mock("Token B", "TKNB", 18);

        // Mint tokens to users
        tokenA.mint(alice, 1000 * 10 ** 18);
        tokenB.mint(bob, 500 * 10 ** 18);

        // Deploy forwarder
        forwarder = new ATKForwarder();

        // Deploy factory implementation directly (no proxy/system needed for unit tests)
        factory = new ATKXvPSettlementFactory(address(forwarder));

        // Initialize the factory
        vm.prank(admin);
        factory.initialize(admin);
    }

    function test_Constructor() public {
        // Test that constructor properly sets the forwarder
        assertTrue(factory.isTrustedForwarder(address(forwarder)));

        // Test that constructor disables initializers
        vm.expectRevert(ATKXvPSettlementFactory.AlreadyInitialized.selector);
        factory.initialize(admin);
    }

    function test_SupportsInterface() public view {
        // Test interface support
        assertTrue(factory.supportsInterface(type(IERC165).interfaceId));
        assertTrue(factory.supportsInterface(type(IAccessControl).interfaceId));

        // Test non-supported interface
        assertFalse(factory.supportsInterface(bytes4(0xdeadbeef)));
    }

    function test_PredictAddress() public view {
        // Create flow parameters
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Get predicted address
        address predicted = factory.predictAddress(flows, cutoffDate, autoExecute);

        // Verify prediction is not zero
        assertTrue(predicted != address(0), "Predicted address should not be zero");

        // Verify prediction is deterministic
        address predicted2 = factory.predictAddress(flows, cutoffDate, autoExecute);
        assertEq(predicted, predicted2, "Predicted address should be deterministic");
    }

    function test_PredictAddressDifferentParams() public view {
        XvPSettlement.Flow[] memory flows1 = new XvPSettlement.Flow[](1);
        flows1[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        XvPSettlement.Flow[] memory flows2 = new XvPSettlement.Flow[](1);
        flows2[0] = XvPSettlement.Flow({ asset: address(tokenB), from: bob, to: alice, amount: 50 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Different flows should result in different addresses
        address predicted1 = factory.predictAddress(flows1, cutoffDate, autoExecute);
        address predicted2 = factory.predictAddress(flows2, cutoffDate, autoExecute);
        assertNotEq(predicted1, predicted2, "Different flows should yield different addresses");

        // Different cutoff dates should result in different addresses
        address predicted3 = factory.predictAddress(flows1, cutoffDate + 1 days, autoExecute);
        assertNotEq(predicted1, predicted3, "Different cutoff dates should yield different addresses");

        // Different autoExecute values should result in different addresses
        address predicted4 = factory.predictAddress(flows1, cutoffDate, true);
        assertNotEq(predicted1, predicted4, "Different autoExecute values should yield different addresses");
    }

    function test_CreateSettlementValidation() public {
        // Test empty flows
        XvPSettlement.Flow[] memory emptyFlows = new XvPSettlement.Flow[](0);
        vm.expectRevert(ATKXvPSettlementFactory.EmptyFlows.selector);
        factory.create(emptyFlows, block.timestamp + 1 days, false);

        // Test past cutoff date
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });
        vm.expectRevert(ATKXvPSettlementFactory.InvalidCutoffDate.selector);
        factory.create(flows, block.timestamp - 1, false);
    }

    function test_CreateSettlementTracking() public {
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Create settlement
        vm.prank(alice);
        address settlementAddr = factory.create(flows, cutoffDate, autoExecute);

        // Verify tracking
        assertTrue(factory.isAddressDeployed(settlementAddr), "Settlement should be tracked as deployed");

        // Try to create same settlement again
        vm.prank(alice);
        vm.expectRevert(ATKXvPSettlementFactory.AddressAlreadyDeployed.selector);
        factory.create(flows, cutoffDate, autoExecute);
    }

    function test_CreateSettlementEvent() public {
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        vm.recordLogs();
        vm.prank(alice);
        address settlementAddr = factory.create(flows, cutoffDate, autoExecute);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();

        bool foundEvent = false;
        for (uint256 i = 0; i < entries.length; i++) {
            VmSafe.Log memory entry = entries[i];
            if (entry.topics[0] == keccak256("XvPSettlementCreated(address,address)")) {
                foundEvent = true;
                assertEq(
                    address(uint160(uint256(entry.topics[1]))), settlementAddr, "Wrong settlement address in event"
                );
                assertEq(address(uint160(uint256(entry.topics[2]))), alice, "Wrong creator address in event");
                break;
            }
        }

        assertTrue(foundEvent, "XvPSettlementCreated event should be emitted");
    }
}
