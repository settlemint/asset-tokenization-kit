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

    event CryptoCurrencyCreated(
        address indexed token,
        string name,
        string symbol,
        uint256 initialSupply,
        address indexed owner,
        uint256 tokenCount
    );

    function setUp() public {
        factory = new CryptoCurrencyFactory();
        owner = address(this);
    }

    function test_CreateToken() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        address tokenAddress = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");
        assertEq(factory.allTokensLength(), 1, "Should have created one token");

        CryptoCurrency token = CryptoCurrency(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.owner(), owner, "Token owner should match");
        assertEq(token.totalSupply(), INITIAL_SUPPLY, "Token supply should match");
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Token ";
        string memory baseSymbol = "TEST";
        uint256 count = 3;

        for (uint256 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            CryptoCurrency token = CryptoCurrency(tokenAddress);
            assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
        }

        assertEq(factory.allTokensLength(), count, "Should have created three tokens");
    }

    function test_RevertWhenZeroAddress() public {
        vm.expectRevert(CryptoCurrencyFactory.ZeroAddress.selector);
        factory.createToken("Test Token", "TEST", INITIAL_SUPPLY, address(0));
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        address token1 = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);

        // Create a new factory instance
        CryptoCurrencyFactory newFactory = new CryptoCurrencyFactory();

        // Create a token with the same parameters
        address token2 = newFactory.createToken(name, symbol, INITIAL_SUPPLY, owner);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        address tokenAddress = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        // Test initial state
        assertEq(token.totalSupply(), INITIAL_SUPPLY, "Initial supply should match");
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        address tokenAddress = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        // Test minting as owner
        uint256 amount = 1000 ether;
        address user = address(0x1);
        vm.prank(owner);
        token.mint(user, amount);
        assertEq(token.balanceOf(user), amount, "User should have minted amount");
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount, "Total supply should be increased");

        // Test minting restrictions
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, amount);
    }

    function test_CreateTokenWithZeroInitialSupply() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";
        uint256 zeroSupply = 0;

        address tokenAddress = factory.createToken(name, symbol, zeroSupply, owner);
        CryptoCurrency token = CryptoCurrency(tokenAddress);

        assertEq(token.totalSupply(), 0, "Initial supply should be zero");
        assertEq(token.balanceOf(owner), 0, "Owner should have zero balance");
    }

    function test_EventEmission() public {
        string memory name = "Test Token";
        string memory symbol = "TEST";

        vm.recordLogs();
        address tokenAddress = factory.createToken(name, symbol, INITIAL_SUPPLY, owner);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 3, "Should emit 3 events: OwnershipTransferred, Transfer, and CryptoCurrencyCreated");

        // The last event should be CryptoCurrencyCreated
        VmSafe.Log memory lastEntry = entries[2];

        // Topic 0 is the event signature
        assertEq(
            lastEntry.topics[0],
            keccak256("CryptoCurrencyCreated(address,string,string,uint256,address,uint256)"),
            "Wrong event signature"
        );

        // Topic 1 is the first indexed parameter (token address)
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");

        // Topic 2 is the second indexed parameter (owner address)
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), owner, "Wrong owner address in event");
    }
}
