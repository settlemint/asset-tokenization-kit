// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { XvPSettlementFactory } from "../../contracts/v1/XvPSettlementFactory.sol";
import { XvPSettlement } from "../../contracts/v1/XvPSettlement.sol";
import { Forwarder } from "../../contracts/Forwarder.sol";
import { ERC20Mock } from "../mocks/ERC20Mock.sol";

contract XvPSettlementFactoryTest is Test {
    XvPSettlementFactory public factory;
    Forwarder public forwarder;
    address public admin;
    address public alice;
    address public bob;
    ERC20Mock public tokenA;
    ERC20Mock public tokenB;

    function setUp() public {
        admin = makeAddr("admin");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        // Deploy mock tokens
        tokenA = new ERC20Mock("Token A", "TKNA", 18);
        tokenB = new ERC20Mock("Token B", "TKNB", 18);

        // Mint tokens to users
        tokenA.mint(alice, 1000 * 10 ** 18);
        tokenB.mint(bob, 500 * 10 ** 18);

        // Deploy forwarder first
        forwarder = new Forwarder();

        // Then deploy factory with forwarder address
        vm.prank(admin);
        factory = new XvPSettlementFactory(address(forwarder));
    }

    function test_CreateSettlement() public {
        // Create a simple settlement with one flow
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        vm.prank(alice);
        address settlementAddress = factory.create(flows, cutoffDate, autoExecute);

        assertNotEq(settlementAddress, address(0), "Settlement address should not be zero");

        XvPSettlement settlement = XvPSettlement(settlementAddress);
        assertEq(settlement.cutoffDate(), cutoffDate, "Settlement cutoffDate should match");
        assertEq(settlement.autoExecute(), autoExecute, "Settlement autoExecute flag should match");

        // Verify the flow details
        XvPSettlement.Flow[] memory flowsData = settlement.flows();
        XvPSettlement.Flow memory flow = flowsData[0];
        assertEq(flow.asset, address(tokenA), "Flow asset should be tokenA");
        assertEq(flow.from, alice, "Flow from should be alice");
        assertEq(flow.to, bob, "Flow to should be bob");
        assertEq(flow.amount, 100 * 10 ** 18, "Flow amount should match");
    }

    function test_CreateMultipleSettlements() public {
        // Create first settlement: Alice sends TokenA to Bob
        XvPSettlement.Flow[] memory flows1 = new XvPSettlement.Flow[](1);
        flows1[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate1 = block.timestamp + 1 days;
        bool autoExecute1 = false;

        vm.prank(alice);
        address settlement1 = factory.create(flows1, cutoffDate1, autoExecute1);

        // Create second settlement: Bob sends TokenB to Alice
        XvPSettlement.Flow[] memory flows2 = new XvPSettlement.Flow[](1);
        flows2[0] = XvPSettlement.Flow({ asset: address(tokenB), from: bob, to: alice, amount: 50 * 10 ** 18 });

        uint256 cutoffDate2 = block.timestamp + 2 days;
        bool autoExecute2 = true;

        vm.prank(bob);
        address settlement2 = factory.create(flows2, cutoffDate2, autoExecute2);

        // Verify both settlements were created with different addresses
        assertNotEq(settlement1, settlement2, "Settlements should have different addresses");

        // Verify factory correctly tracks deployed contracts
        assertTrue(factory.isAddressDeployed(settlement1), "Factory should recognize first settlement");
        assertTrue(factory.isAddressDeployed(settlement2), "Factory should recognize second settlement");
    }

    function test_DeterministicAddresses() public {
        // Create settlement parameters
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Predict address before deployment
        address predictedAddress = factory.predictAddress(flows, cutoffDate, autoExecute);

        // Create the settlement
        vm.prank(alice);
        address actualAddress = factory.create(flows, cutoffDate, autoExecute);

        // Verify the predicted address matches the actual address
        assertEq(predictedAddress, actualAddress, "Predicted address should match actual address");

        // Create a new factory instance
        XvPSettlementFactory newFactory = new XvPSettlementFactory(address(forwarder));

        // Predict address with new factory
        address newPredictedAddress = newFactory.predictAddress(flows, cutoffDate, autoExecute);

        // Create settlement with new factory
        vm.prank(alice);
        address newActualAddress = newFactory.create(flows, cutoffDate, autoExecute);

        // Verify the new factory's predicted address matches its actual address
        assertEq(newPredictedAddress, newActualAddress, "New factory's predicted address should match actual address");

        // Verify addresses from different factories are different
        assertNotEq(actualAddress, newActualAddress, "Addresses from different factories should be different");
    }

    function test_SettlementInitialization() public {
        // Create a bidirectional swap settlement
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](2);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });
        flows[1] = XvPSettlement.Flow({ asset: address(tokenB), from: bob, to: alice, amount: 50 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = true;

        vm.prank(alice);
        address settlementAddress = factory.create(flows, cutoffDate, autoExecute);

        XvPSettlement settlement = XvPSettlement(settlementAddress);

        // Test initial state
        assertEq(settlement.cutoffDate(), cutoffDate, "CutoffDate should match");
        assertEq(settlement.autoExecute(), autoExecute, "AutoExecute should match");
        assertFalse(settlement.claimed(), "Settlement should not be claimed initially");
        assertFalse(settlement.cancelled(), "Settlement should not be cancelled initially");
    }

    function test_EventEmission() public {
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        vm.recordLogs();
        vm.prank(alice);
        address settlementAddress = factory.create(flows, cutoffDate, autoExecute);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();

        // Find and verify XvPSettlementCreated event
        bool foundEvent = false;
        for (uint256 i = 0; i < entries.length; i++) {
            VmSafe.Log memory entry = entries[i];
            if (entry.topics[0] == keccak256("XvPSettlementCreated(address,address)")) {
                foundEvent = true;
                assertEq(
                    address(uint160(uint256(entry.topics[1]))), settlementAddress, "Wrong settlement address in event"
                );
                assertEq(address(uint160(uint256(entry.topics[2]))), alice, "Wrong creator address in event");
                break;
            }
        }

        assertTrue(foundEvent, "XvPSettlementCreated event should be emitted");
    }

    function test_InvalidParameters() public {
        // Test with invalid cutoff date (in the past)
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 pastCutoffDate = block.timestamp - 1;
        bool autoExecute = false;

        vm.prank(alice);
        vm.expectRevert(XvPSettlementFactory.InvalidCutoffDate.selector);
        factory.create(flows, pastCutoffDate, autoExecute);

        // Test with empty flows array
        XvPSettlement.Flow[] memory emptyFlows = new XvPSettlement.Flow[](0);
        uint256 validCutoffDate = block.timestamp + 1 days;

        vm.prank(alice);
        vm.expectRevert(XvPSettlementFactory.EmptyFlows.selector);
        factory.create(emptyFlows, validCutoffDate, autoExecute);
    }

    function test_AddressAlreadyDeployed() public {
        // Create a settlement
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenA), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        vm.prank(alice);
        factory.create(flows, cutoffDate, autoExecute);

        // Try to create the exact same settlement again
        vm.prank(alice);
        vm.expectRevert(XvPSettlementFactory.AddressAlreadyDeployed.selector);
        factory.create(flows, cutoffDate, autoExecute);
    }
}
