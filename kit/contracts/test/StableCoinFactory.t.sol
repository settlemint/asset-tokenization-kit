// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { StableCoinFactory } from "../contracts/StableCoinFactory.sol";
import { StableCoin } from "../contracts/StableCoin.sol";

contract StableCoinFactoryTest is Test {
    StableCoinFactory public factory;
    address public owner;
    uint48 public constant LIVENESS = 7 days;

    event StableCoinCreated(
        address indexed token,
        string name,
        string symbol,
        address indexed owner,
        uint48 collateralLivenessSeconds,
        uint256 tokenCount
    );

    function setUp() public {
        factory = new StableCoinFactory();
        owner = address(this);
    }

    function test_CreateToken() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        address tokenAddress = factory.create(name, symbol, LIVENESS);

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");
        assertEq(factory.allTokensLength(), 1, "Should have created one token");

        StableCoin token = StableCoin(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.owner(), owner, "Token owner should match");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Stable ";
        string memory baseSymbol = "TSTB";
        uint256 count = 3;

        for (uint256 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.create(name, symbol, LIVENESS);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            StableCoin token = StableCoin(tokenAddress);
            (uint256 collateral, uint48 timestamp) = token.collateral();
            assertEq(collateral, 0, "Initial collateral should be zero");
            assertEq(timestamp, block.timestamp, "Timestamp should be current block");
        }

        assertEq(factory.allTokensLength(), count, "Should have created three tokens");
    }

    function test_RevertWhenInvalidLiveness() public {
        vm.expectRevert(StableCoinFactory.InvalidLiveness.selector);
        factory.create("Test Stable", "TSTB", 0);
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        address token1 = factory.create(name, symbol, LIVENESS);

        // Create a new factory instance
        StableCoinFactory newFactory = new StableCoinFactory();

        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, LIVENESS);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        address tokenAddress = factory.create(name, symbol, LIVENESS);
        StableCoin token = StableCoin(tokenAddress);

        // Test initial state
        assertFalse(token.paused(), "Token should not be paused initially");
        assertEq(token.totalSupply(), 0, "Initial supply should be zero");

        // Test collateral state
        (uint256 collateral, uint48 timestamp) = token.collateral();
        assertEq(collateral, 0, "Initial collateral should be zero");
        assertEq(timestamp, block.timestamp, "Timestamp should be current block");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        address tokenAddress = factory.create(name, symbol, LIVENESS);
        StableCoin token = StableCoin(tokenAddress);

        // First update collateral
        uint256 collateralAmount = 1000 ether;
        vm.prank(owner);
        token.updateCollateral(collateralAmount);

        // Then test minting
        uint256 amount = 100 ether; // Mint less than collateral
        vm.prank(owner);
        token.mint(owner, amount);
        assertEq(token.balanceOf(owner), amount, "Balance should match minted amount");
        assertEq(token.totalSupply(), amount, "Total supply should match minted amount");

        // Test pausing
        vm.prank(owner);
        token.pause();
        assertTrue(token.paused(), "Token should be paused");

        // Test unpausing
        vm.prank(owner);
        token.unpause();
        assertFalse(token.paused(), "Token should be unpaused");
    }

    function test_EventEmission() public {
        string memory name = "Test Stable";
        string memory symbol = "TSTB";

        vm.recordLogs();
        address tokenAddress = factory.create(name, symbol, LIVENESS);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 2, "Should emit 2 events: OwnershipTransferred and StableCoinCreated");

        // The last event should be StableCoinCreated
        VmSafe.Log memory lastEntry = entries[1];

        // Topic 0 is the event signature
        assertEq(
            lastEntry.topics[0],
            keccak256("StableCoinCreated(address,string,string,address,uint48,uint256)"),
            "Wrong event signature"
        );

        // Topic 1 is the first indexed parameter (token address)
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");

        // Topic 2 is the second indexed parameter (owner address)
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), owner, "Wrong owner address in event");
    }
}
