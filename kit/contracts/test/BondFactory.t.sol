// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { Vm } from "forge-std/Vm.sol";
import { BondFactory } from "../contracts/BondFactory.sol";
import { Bond } from "../contracts/Bond.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { ERC2771Forwarder } from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract BondFactoryTest is Test {
    BondFactory public factory;
    Forwarder public forwarder;
    ERC20Mock public underlyingAsset;
    address public owner;
    uint256 public futureDate;
    uint8 public constant DECIMALS = 8;
    uint256 public constant FACE_VALUE = 100e18; // 100 underlying tokens per bond
    string public constant VALID_ISIN = "US0378331005";
    uint256 public constant CAP = 1000 * 10 ** DECIMALS; // 1000 tokens cap

    // Meta-transaction related
    uint256 internal constant DEADLINE = 2 ** 256 - 1;
    uint256 internal constant GAS_LIMIT = 500_000;
    uint256 internal ownerPrivateKey;

    function setUp() public {
        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);
        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new BondFactory(address(forwarder));

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
        assertEq(bond.maturityDate(), futureDate, "Bond maturity date should match");

        // Test factory tracking
        assertTrue(factory.isFactoryToken(bondAddress), "Bond should be tracked as factory token");
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
            assertTrue(factory.isFactoryToken(bondAddress), "Bond should be tracked as factory token");
        }
    }

    function test_PredictAddress() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        vm.startPrank(owner);
        address predictedAddress = factory.predictAddress(
            owner, name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset)
        );

        address actualAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        assertEq(predictedAddress, actualAddress, "Predicted address should match actual address");
        vm.stopPrank();
    }

    function test_RevertDuplicateDeployment() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        // First deployment should succeed
        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));
        assertTrue(factory.isFactoryToken(bondAddress), "First deployment should be tracked");

        // Second deployment with same parameters should revert
        vm.expectRevert(BondFactory.AddressAlreadyDeployed.selector);
        factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bond1 =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));

        // Create a new factory instance
        BondFactory newFactory = new BondFactory(address(forwarder));

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

        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            4,
            "Should emit 4 events: RoleGranted (admin), RoleGranted (supply), RoleGranted (user), and BondCreated"
        );

        // First event should be RoleGranted for DEFAULT_ADMIN_ROLE
        Vm.Log memory firstEntry = entries[0];
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
        Vm.Log memory secondEntry = entries[1];
        assertEq(
            secondEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for second RoleGranted"
        );

        // Third event should be RoleGranted for USER_MANAGEMENT_ROLE
        Vm.Log memory thirdEntry = entries[2];
        assertEq(
            thirdEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for third RoleGranted"
        );

        // Fourth event should be BondCreated
        Vm.Log memory lastEntry = entries[3];
        assertEq(
            lastEntry.topics[0], keccak256("BondCreated(address,address)"), "Wrong event signature for BondCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), bondAddress, "Wrong bond address in event");
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), address(this), "Wrong creator address in event");
    }

    function test_BondMaturity() public {
        string memory name = "Test Bond";
        string memory symbol = "TBOND";

        address bondAddress =
            factory.create(name, symbol, DECIMALS, VALID_ISIN, CAP, futureDate, FACE_VALUE, address(underlyingAsset));
        Bond bond = Bond(bondAddress);

        // Try to mature before maturity date
        vm.expectRevert(Bond.BondNotYetMatured.selector);
        vm.prank(address(this));
        bond.mature();

        // Move time to maturity date
        vm.warp(futureDate);

        // Mint some bonds first
        vm.startPrank(address(this));
        bond.mint(address(this), 100 * 10 ** DECIMALS); // Mint 100 bonds

        // Add required underlying assets
        uint256 requiredAmount = bond.totalUnderlyingNeeded();
        underlyingAsset.mint(address(this), requiredAmount);
        underlyingAsset.approve(address(bond), requiredAmount);
        bond.topUpUnderlyingAsset(requiredAmount);

        // Now mature the bond
        bond.mature();
        assertTrue(bond.isMatured(), "Bond should be matured");

        // Try to mature again
        vm.expectRevert(Bond.BondAlreadyMatured.selector);
        bond.mature();
        vm.stopPrank();
    }
}
