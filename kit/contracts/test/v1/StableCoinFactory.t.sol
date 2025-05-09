// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { StableCoinFactory } from "../../contracts/v1/StableCoinFactory.sol";
import { StableCoin } from "../../contracts/v1/StableCoin.sol";
import { Forwarder } from "../../contracts/Forwarder.sol";

contract StableCoinFactoryTest is Test {
    StableCoinFactory public factory;
    Forwarder public forwarder;
    address public owner;
    uint48 public constant LIVENESS = 7 days;
    uint8 public constant DECIMALS = 8;
    uint256 public constant INITIAL_SUPPLY = 1_000_000;

    function setUp() public {
        owner = makeAddr("owner");
        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new StableCoinFactory(address(forwarder));
    }

    function test_CreateToken() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, LIVENESS);
        vm.stopPrank();

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");

        StableCoin token = StableCoin(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.decimals(), DECIMALS, "Token decimals should match");
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertTrue(token.hasRole(token.USER_MANAGEMENT_ROLE(), owner), "Owner should have user management role");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Stable ";
        string memory baseSymbol = "TSTB";
        uint8[] memory decimalValues = new uint8[](3);
        decimalValues[0] = 6;
        decimalValues[1] = 8;
        decimalValues[2] = 18;

        for (uint256 i = 0; i < decimalValues.length; ++i) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.create(name, symbol, decimalValues[i], LIVENESS);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            StableCoin token = StableCoin(tokenAddress);
            assertEq(token.decimals(), decimalValues[i], "Token decimals should match");
            (uint256 collateralAmount, uint48 collateralTimestamp) = token.collateral();
            assertEq(collateralAmount, 0, "Initial collateral should be zero");
            assertEq(collateralTimestamp, 0, "Initial timestamp should be zero");
        }
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Stable Coin";
        string memory symbol = "TSC";

        address token1 = factory.create(name, symbol, DECIMALS, LIVENESS);

        // Create a new factory instance
        StableCoinFactory newFactory = new StableCoinFactory(address(forwarder));

        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, DECIMALS, LIVENESS);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        address tokenAddress = factory.create(name, symbol, DECIMALS, LIVENESS);
        StableCoin token = StableCoin(tokenAddress);

        // Test initial state
        assertEq(token.decimals(), DECIMALS, "Decimals should match");
        assertFalse(token.paused(), "Token should not be paused initially");
        assertEq(token.totalSupply(), 0, "Initial supply should be zero");

        // Test collateral state
        (uint256 collateralAmount, uint48 collateralTimestamp) = token.collateral();
        assertEq(collateralAmount, 0, "Initial collateral should be zero");
        assertEq(collateralTimestamp, 0, "Initial timestamp should be zero");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, LIVENESS);
        StableCoin token = StableCoin(tokenAddress);

        // Test minting with supply management role
        uint256 amount = 1000 ether;
        address user = makeAddr("user");
        token.updateCollateral(amount);
        token.mint(user, amount);
        assertEq(token.balanceOf(user), amount, "User should have minted amount");
        assertEq(token.totalSupply(), amount, "Total supply should match minted amount");
        vm.stopPrank();

        // Test minting without supply management role
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user, token.AUDITOR_ROLE())
        );
        token.updateCollateral(amount);
        vm.stopPrank();

        // Test pausing with admin role
        vm.startPrank(owner);
        token.pause();
        assertTrue(token.paused(), "Token should be paused");
        vm.stopPrank();

        // Test pausing without admin role
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user, token.DEFAULT_ADMIN_ROLE()
            )
        );
        token.pause();
        vm.stopPrank();

        // Test unpausing with admin role
        vm.startPrank(owner);
        token.unpause();
        assertFalse(token.paused(), "Token should be unpaused");
        vm.stopPrank();
    }

    function test_EventEmission() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        vm.recordLogs();
        address tokenAddress = factory.create(name, symbol, DECIMALS, LIVENESS);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            5,
            "Should emit 5 events: RoleGranted (admin), RoleGranted (supply), RoleGranted (user), RoleGranted (auditor) and StableCoinCreated"
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

        // Fourth event should be RoleGranted for AUDITOR_ROLE
        VmSafe.Log memory fourthEntry = entries[3];
        assertEq(
            fourthEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for fourth RoleGranted"
        );

        // Fifth event should be StableCoinCreated
        VmSafe.Log memory lastEntry = entries[4];
        assertEq(
            lastEntry.topics[0],
            keccak256("StableCoinCreated(address,address)"),
            "Wrong event signature for StableCoinCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), address(this), "Wrong creator address in event");
    }
}
