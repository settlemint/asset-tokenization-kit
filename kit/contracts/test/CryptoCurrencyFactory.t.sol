// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { CryptoCurrencyFactory } from "../contracts/CryptoCurrencyFactory.sol";
import { CryptoCurrency } from "../contracts/CryptoCurrency.sol";

contract CryptoCurrencyFactoryTest is Test {
    CryptoCurrencyFactory public factory;
    address public owner;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;

    function setUp() public {
        owner = makeAddr("owner");
        factory = new CryptoCurrencyFactory();
    }

    function test_CreateToken() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, INITIAL_SUPPLY);
        vm.stopPrank();

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");
        assertEq(factory.allTokensLength(), 1, "Should have created one token");

        CryptoCurrency token = CryptoCurrency(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertEq(token.totalSupply(), INITIAL_SUPPLY, "Token supply should match");
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Token ";
        string memory baseSymbol = "TEST";
        uint256 count = 3;

        vm.startPrank(owner);
        for (uint256 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.create(name, symbol, INITIAL_SUPPLY);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            CryptoCurrency token = CryptoCurrency(tokenAddress);
            assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
        }
        vm.stopPrank();

        assertEq(factory.allTokensLength(), count, "Should have created three tokens");
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.startPrank(owner);
        address token1 = factory.create(name, symbol, INITIAL_SUPPLY);
        vm.stopPrank();

        // Create a new factory instance
        CryptoCurrencyFactory newFactory = new CryptoCurrencyFactory();

        vm.startPrank(owner);
        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, INITIAL_SUPPLY);
        vm.stopPrank();

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, INITIAL_SUPPLY);
        vm.stopPrank();
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        // Test initial state
        assertEq(token.totalSupply(), INITIAL_SUPPLY, "Initial supply should match");
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, INITIAL_SUPPLY);
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        // Test minting with supply management role
        uint256 amount = 1000 ether;
        address user = makeAddr("user");
        token.mint(user, amount);
        assertEq(token.balanceOf(user), amount, "User should have minted amount");
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount, "Total supply should be increased");
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
    }

    function test_CreateTokenWithZeroInitialSupply() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";
        uint256 zeroSupply = 0;

        address tokenAddress = factory.create(name, symbol, zeroSupply);
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        assertEq(token.totalSupply(), 0, "Initial supply should be zero");
        assertEq(token.balanceOf(owner), 0, "Owner should have zero balance");
    }

    function test_EventEmission() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.recordLogs();
        address tokenAddress = factory.create(name, symbol, INITIAL_SUPPLY);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            4,
            "Should emit 4 events: RoleGranted (admin), RoleGranted (supply), Transfer, and CryptoCurrencyCreated"
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

        // Third event should be Transfer
        VmSafe.Log memory thirdEntry = entries[2];
        assertEq(
            thirdEntry.topics[0], keccak256("Transfer(address,address,uint256)"), "Wrong event signature for Transfer"
        );

        // Fourth event should be CryptoCurrencyCreated
        VmSafe.Log memory lastEntry = entries[3];
        assertEq(
            lastEntry.topics[0],
            keccak256("CryptoCurrencyCreated(address,string,string,address,uint256)"),
            "Wrong event signature for CryptoCurrencyCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");
    }
}
