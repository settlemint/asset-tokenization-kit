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
    uint8 public constant DECIMALS = 8;

    function setUp() public {
        factory = new BondFactory();
        owner = address(this);
        // Set maturity date to 1 year from now
        futureDate = block.timestamp + 365 days;
    }

    function test_CreateBond() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.prank(owner);
        address bondAddress = factory.create(name, symbol, DECIMALS, futureDate);

        assertNotEq(bondAddress, address(0), "Bond address should not be zero");
        assertEq(factory.allBondsLength(), 1, "Should have created one bond");

        Bond bond = Bond(bondAddress);
        assertEq(bond.name(), name, "Bond name should match");
        assertEq(bond.symbol(), symbol, "Bond symbol should match");
        assertEq(bond.decimals(), DECIMALS, "Bond decimals should match");
        assertTrue(bond.hasRole(bond.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(bond.hasRole(bond.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertTrue(bond.hasRole(bond.USER_MANAGEMENT_ROLE(), owner), "Owner should have user management role");
        assertEq(bond.maturityDate(), futureDate, "Bond maturity date should match");
    }

    function test_CreateMultipleBonds() public {
        string memory baseName = "Test Bond ";
        string memory baseSymbol = "TBOND";
        uint8[] memory decimalValues = new uint8[](3);
        decimalValues[0] = 6;
        decimalValues[1] = 8;
        decimalValues[2] = 18;

        for (uint256 i = 0; i < decimalValues.length; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address bondAddress = factory.create(name, symbol, decimalValues[i], futureDate);
            assertNotEq(bondAddress, address(0), "Bond address should not be zero");

            Bond bond = Bond(bondAddress);
            assertEq(bond.decimals(), decimalValues[i], "Bond decimals should match");
        }

        assertEq(factory.allBondsLength(), 3, "Should have created three bonds");
    }

    function test_RevertWhenInvalidMaturityDate() public {
        // Try to create a bond with maturity date in the past
        vm.warp(2 days); // Move time forward to avoid underflow
        uint256 pastDate = block.timestamp - 1 days;
        vm.expectRevert(BondFactory.InvalidMaturityDate.selector);
        factory.create("Test Bond", "TBOND", DECIMALS, pastDate);

        // Try to create a bond with current timestamp
        vm.expectRevert(BondFactory.InvalidMaturityDate.selector);
        factory.create("Test Bond", "TBOND", DECIMALS, block.timestamp);
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bond1 = factory.create(name, symbol, DECIMALS, futureDate);

        // Create a new factory instance
        BondFactory newFactory = new BondFactory();

        // Create a bond with the same parameters
        address bond2 = newFactory.create(name, symbol, DECIMALS, futureDate);

        // The addresses should be different because the factory addresses are different
        assertNotEq(bond1, bond2, "Bonds should have different addresses due to different factory addresses");
    }

    function test_BondInitialization() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress = factory.create(name, symbol, DECIMALS, futureDate);
        Bond bond = Bond(bondAddress);

        // Test initial state
        assertEq(bond.decimals(), DECIMALS, "Bond decimals should match");
        assertFalse(bond.paused(), "Bond should not be paused initially");
        assertFalse(bond.isMatured(), "Bond should not be matured initially");
    }

    function test_EventEmission() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.recordLogs();
        address bondAddress = factory.create(name, symbol, DECIMALS, futureDate);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            4,
            "Should emit 4 events: RoleGranted (admin), RoleGranted (supply), RoleGranted (user), and BondCreated"
        );

        // First event should be RoleGranted for DEFAULT_ADMIN_ROLE
        VmSafe.Log memory firstEntry = entries[0];
        assertEq(
            firstEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for first RoleGranted"
        );
        assertEq(
            firstEntry.topics[1],
            bytes32(0), // DEFAULT_ADMIN_ROLE is bytes32(0)
            "Wrong role in first RoleGranted"
        );

        // Second event should be RoleGranted for SUPPLY_MANAGEMENT_ROLE
        VmSafe.Log memory secondEntry = entries[1];
        assertEq(
            secondEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for second RoleGranted"
        );

        // Third event should be RoleGranted for USER_MANAGEMENT_ROLE
        VmSafe.Log memory thirdEntry = entries[2];
        assertEq(
            thirdEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for third RoleGranted"
        );

        // Fourth event should be BondCreated
        VmSafe.Log memory lastEntry = entries[3];
        assertEq(
            lastEntry.topics[0],
            keccak256("BondCreated(address,string,string,uint8,address,uint256)"),
            "Wrong event signature for BondCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), bondAddress, "Wrong bond address in event");
    }

    function test_BondMaturity() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress = factory.create(name, symbol, DECIMALS, futureDate);
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
