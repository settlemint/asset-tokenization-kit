// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { TokenizedDepositFactory } from "../contracts/TokenizedDepositFactory.sol";
import { TokenizedDeposit } from "../contracts/TokenizedDeposit.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract TokenizedDepositFactoryTest is Test {
    TokenizedDepositFactory public factory;
    Forwarder public forwarder;
    address public owner;
    uint8 public constant DECIMALS = 8;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;

    function setUp() public {
        owner = makeAddr("owner");
        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new TokenizedDepositFactory(address(forwarder));
    }

    function test_CreateToken() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.stopPrank();

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");

        TokenizedDeposit token = TokenizedDeposit(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.decimals(), DECIMALS, "Token decimals should match");
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertTrue(token.hasRole(token.USER_MANAGEMENT_ROLE(), owner), "Owner should have user management role");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Deposit ";
        string memory baseSymbol = "TDEP";
        uint8[] memory decimalValues = new uint8[](3);
        decimalValues[0] = 6;
        decimalValues[1] = 8;
        decimalValues[2] = 18;

        for (uint256 i = 0; i < decimalValues.length; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.create(name, symbol, decimalValues[i], COLLATERAL_LIVENESS);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            TokenizedDeposit token = TokenizedDeposit(tokenAddress);
            assertEq(token.decimals(), decimalValues[i], "Token decimals should match");
        }
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Deposit Token";
        string memory symbol = "TDT";

        address token1 = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);

        // Create a new factory instance
        TokenizedDepositFactory newFactory = new TokenizedDepositFactory(address(forwarder));

        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        address tokenAddress = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        TokenizedDeposit token = TokenizedDeposit(tokenAddress);

        // Test initial state
        assertEq(token.decimals(), DECIMALS, "Decimals should match");
        assertFalse(token.paused(), "Token should not be paused initially");
        assertEq(token.totalSupply(), 0, "Initial supply should be zero");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        TokenizedDeposit token = TokenizedDeposit(tokenAddress);

        // Test minting with supply management role
        uint256 amount = 1000 ether;
        address user = makeAddr("user");

        // Important: First allow the user, then update collateral before minting
        token.allowUser(user);
        // Update collateral before minting
        token.updateCollateral(amount);
        // Now mint tokens
        token.mint(user, amount);

        assertEq(token.balanceOf(user), amount, "User should have minted amount");
        assertEq(token.totalSupply(), amount, "Total supply should match minted amount");
        vm.stopPrank();

        // Test minting without supply management role
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user, token.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        token.mint(user, amount);
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
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        vm.recordLogs();
        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.stopPrank();

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        // Updated to match the actual number of events emitted
        assertEq(
            entries.length,
            5,
            "Should emit 5 events: UserAllowed, RoleGranted (admin), RoleGranted (supply), RoleGranted (user), and TokenizedDepositCreated"
        );

        // First event should be UserAllowed for the owner
        VmSafe.Log memory firstEntry = entries[0];
        assertEq(firstEntry.topics[0], keccak256("UserAllowed(address)"), "Wrong event signature for UserAllowed");

        // Second event should be RoleGranted for DEFAULT_ADMIN_ROLE
        VmSafe.Log memory secondEntry = entries[1];
        assertEq(
            secondEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for first RoleGranted"
        );
        assertEq(
            secondEntry.topics[1],
            bytes32(0), // DEFAULT_ADMIN_ROLE is bytes32(0)
            "Wrong role in first RoleGranted"
        );

        // Third event should be RoleGranted for SUPPLY_MANAGEMENT_ROLE
        VmSafe.Log memory thirdEntry = entries[2];
        assertEq(
            thirdEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for second RoleGranted"
        );

        // Fourth event should be RoleGranted for USER_MANAGEMENT_ROLE
        VmSafe.Log memory fourthEntry = entries[3];
        assertEq(
            fourthEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for third RoleGranted"
        );

        // Fifth event should be TokenizedDepositCreated
        VmSafe.Log memory lastEntry = entries[4];
        assertEq(
            lastEntry.topics[0],
            keccak256("TokenizedDepositCreated(address,address)"),
            "Wrong event signature for TokenizedDepositCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), owner, "Wrong creator address in event");
    }

    function test_PredictAddress() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        address predicted = factory.predictAddress(owner, name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.startPrank(owner);
        address actual = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.stopPrank();

        assertEq(predicted, actual, "Predicted address should match actual deployed address");
    }

    function test_IsFactoryToken() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.stopPrank();

        assertTrue(factory.isFactoryToken(tokenAddress), "Should recognize token as created by factory");
        assertFalse(factory.isFactoryToken(address(0x1)), "Should not recognize random address as factory token");
    }

    function test_RevertOnDuplicateAddress() public {
        string memory name = "Test Deposit";
        string memory symbol = "TDEP";

        vm.startPrank(owner);
        factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);

        vm.expectRevert(abi.encodeWithSelector(TokenizedDepositFactory.AddressAlreadyDeployed.selector));
        factory.create(name, symbol, DECIMALS, COLLATERAL_LIVENESS);
        vm.stopPrank();
    }
}
