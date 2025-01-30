// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { BondFactory } from "../contracts/BondFactory.sol";
import { Bond } from "../contracts/Bond.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";

contract BondFactoryTest is Test {
    BondFactory public factory;
    ERC20Mock public underlyingAsset;
    address public owner;
    uint256 public futureDate;
    uint8 public constant DECIMALS = 8;
    uint256 public constant FACE_VALUE = 100e18; // 100 underlying tokens per bond
    string public constant VALID_ISIN = "US0378331005";
    uint256 public constant CAP = 1000 * 10 ** DECIMALS; // 1000 tokens cap

    function setUp() public {
        factory = new BondFactory();
        owner = address(this);
        // Set maturity date to 1 year from now
        futureDate = block.timestamp + 365 days;

        // Deploy mock underlying asset
        underlyingAsset = new ERC20Mock("Mock USD", "MUSD", DECIMALS);
    }

    function test_CreateBond() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.prank(owner);
        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        assertNotEq(bondAddress, address(0), "Bond address should not be zero");
        assertEq(factory.allBondsLength(), 1, "Should have created one bond");

        Bond bond = Bond(bondAddress);
        assertEq(bond.name(), name, "Bond name should match");
        assertEq(bond.symbol(), symbol, "Bond symbol should match");
        assertEq(bond.decimals(), DECIMALS, "Bond decimals should match");
        assertEq(bond.faceValue(), FACE_VALUE, "Bond face value should match");
        assertEq(address(bond.underlyingAsset()), address(underlyingAsset), "Bond underlying asset should match");
        assertEq(bond.isin(), VALID_ISIN, "Bond ISIN should match");
        assertEq(bond.cap(), CAP, "Bond cap should match");
        assertTrue(bond.hasRole(bond.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(bond.hasRole(bond.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertTrue(bond.hasRole(bond.USER_MANAGEMENT_ROLE(), owner), "Owner should have user management role");
        assertTrue(bond.hasRole(bond.FINANCIAL_MANAGEMENT_ROLE(), owner), "Owner should have financial management role");
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

            address bondAddress = factory.create(
                name, symbol, decimalValues[i], VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset)
            );
            assertNotEq(bondAddress, address(0), "Bond address should not be zero");

            Bond bond = Bond(bondAddress);
            assertEq(bond.decimals(), decimalValues[i], "Bond decimals should match");
            assertEq(bond.faceValue(), FACE_VALUE, "Bond face value should match");
            assertEq(address(bond.underlyingAsset()), address(underlyingAsset), "Bond underlying asset should match");
            assertEq(bond.isin(), VALID_ISIN, "Bond ISIN should match");
            assertEq(bond.cap(), CAP, "Bond cap should match");
        }

        assertEq(factory.allBondsLength(), 3, "Should have created three bonds");
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bond1 =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        // Create a new factory instance
        BondFactory newFactory = new BondFactory();

        // Create a bond with the same parameters
        address bond2 =
            newFactory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        // The addresses should be different because the factory addresses are different
        assertNotEq(bond1, bond2, "Bonds should have different addresses due to different factory addresses");
    }

    function test_BondInitialization() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));
        Bond bond = Bond(bondAddress);

        // Test initial state
        assertEq(bond.decimals(), DECIMALS, "Bond decimals should match");
        assertEq(bond.faceValue(), FACE_VALUE, "Bond face value should match");
        assertEq(address(bond.underlyingAsset()), address(underlyingAsset), "Bond underlying asset should match");
        assertEq(bond.isin(), VALID_ISIN, "Bond ISIN should match");
        assertFalse(bond.paused(), "Bond should not be paused initially");
        assertFalse(bond.isMatured(), "Bond should not be matured initially");
    }

    function test_EventEmission() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.recordLogs();
        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            5,
            "Should emit 5 events: RoleGranted (admin), RoleGranted (supply), RoleGranted (user), RoleGranted (financial), and BondCreated"
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

        // Fourth event should be RoleGranted for FINANCIAL_MANAGEMENT_ROLE
        VmSafe.Log memory fourthEntry = entries[3];
        assertEq(
            fourthEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for fourth RoleGranted"
        );

        // Fifth event should be BondCreated
        VmSafe.Log memory lastEntry = entries[4];
        assertEq(
            lastEntry.topics[0],
            keccak256("BondCreated(address,string,string,uint8,address,string,uint256,address,uint256)"),
            "Wrong event signature for BondCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), bondAddress, "Wrong bond address in event");
    }

    function test_BondMaturity() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));
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
