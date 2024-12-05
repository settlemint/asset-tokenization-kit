// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { BondFactory } from "../contracts/BondFactory.sol";
import { Bond } from "../contracts/Bond.sol";

contract BondFactoryTest is Test {
    BondFactory public factory;
    address public owner;
    uint256 public futureDate;

    event BondCreated(
        address indexed bond, string name, string symbol, address indexed owner, uint256 maturityDate, uint256 bondCount
    );

    function setUp() public {
        factory = new BondFactory();
        owner = address(this);
        // Set maturity date to 1 year from now
        futureDate = block.timestamp + 365 days;
    }

    function test_CreateBond() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress = factory.create(name, symbol, futureDate);

        assertNotEq(bondAddress, address(0), "Bond address should not be zero");
        assertEq(factory.allBondsLength(), 1, "Should have created one bond");

        Bond bond = Bond(bondAddress);
        assertEq(bond.name(), name, "Bond name should match");
        assertEq(bond.symbol(), symbol, "Bond symbol should match");
        assertEq(bond.owner(), owner, "Bond owner should match");
        assertEq(bond.maturityDate(), futureDate, "Bond maturity date should match");
    }

    function test_CreateMultipleBonds() public {
        string memory baseName = "Test Bond ";
        string memory baseSymbol = "TBOND";
        uint256 count = 3;

        for (uint256 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address bondAddress = factory.create(name, symbol, futureDate);
            assertNotEq(bondAddress, address(0), "Bond address should not be zero");
        }

        assertEq(factory.allBondsLength(), count, "Should have created three bonds");
    }

    function test_RevertWhenInvalidMaturityDate() public {
        // Try to create a bond with maturity date in the past
        vm.warp(2 days); // Move time forward to avoid underflow
        uint256 pastDate = block.timestamp - 1 days;
        vm.expectRevert(BondFactory.InvalidMaturityDate.selector);
        factory.create("Test Bond", "TBOND", pastDate);

        // Try to create a bond with current timestamp
        vm.expectRevert(BondFactory.InvalidMaturityDate.selector);
        factory.create("Test Bond", "TBOND", block.timestamp);
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bond1 = factory.create(name, symbol, futureDate);

        // Create a new factory instance
        BondFactory newFactory = new BondFactory();

        // Create a bond with the same parameters
        address bond2 = newFactory.create(name, symbol, futureDate);

        // The addresses should be different because the factory addresses are different
        assertNotEq(bond1, bond2, "Bonds should have different addresses due to different factory addresses");
    }

    function test_BondInitialization() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress = factory.create(name, symbol, futureDate);
        Bond bond = Bond(bondAddress);

        // Test initial state
        assertFalse(bond.paused(), "Bond should not be paused initially");
        assertFalse(bond.isMatured(), "Bond should not be matured initially");
    }

    function test_EventEmission() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.recordLogs();
        address bondAddress = factory.create(name, symbol, futureDate);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 2, "Should emit 2 events: OwnershipTransferred and BondCreated");

        // The last event should be BondCreated
        VmSafe.Log memory lastEntry = entries[1];

        // Topic 0 is the event signature
        assertEq(
            lastEntry.topics[0],
            keccak256("BondCreated(address,string,string,address,uint256,uint256)"),
            "Wrong event signature"
        );

        // Topic 1 is the first indexed parameter (bond address)
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), bondAddress, "Wrong bond address in event");

        // Topic 2 is the second indexed parameter (owner address)
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), owner, "Wrong owner address in event");
    }

    function test_BondMaturity() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress = factory.create(name, symbol, futureDate);
        Bond bond = Bond(bondAddress);

        // Try to mature before maturity date
        vm.expectRevert(Bond.BondNotYetMatured.selector);
        vm.prank(owner);
        bond.mature();

        // Move time to maturity date
        vm.warp(futureDate);

        // Now mature the bond
        vm.prank(owner);
        bond.mature();
        assertTrue(bond.isMatured(), "Bond should be matured");

        // Try to mature again
        vm.expectRevert(Bond.BondAlreadyMatured.selector);
        vm.prank(owner);
        bond.mature();
    }
}
