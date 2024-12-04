// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { EquityFactory } from "../contracts/EquityFactory.sol";
import { Equity } from "../contracts/Equity.sol";

contract EquityFactoryTest is Test {
    EquityFactory public factory;
    address public owner;

    event EquityCreated(
        address indexed token,
        string name,
        string symbol,
        string class,
        string category,
        address indexed owner,
        uint256 tokenCount
    );

    function setUp() public {
        factory = new EquityFactory();
        owner = address(this);
    }

    function test_CreateToken() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address tokenAddress = factory.createToken(name, symbol, class, category, owner);

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");
        assertEq(factory.allTokensLength(), 1, "Should have created one token");

        Equity token = Equity(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.owner(), owner, "Token owner should match");
        assertEq(token.equityClass(), class, "Token class should match");
        assertEq(token.equityCategory(), category, "Token category should match");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Equity ";
        string memory baseSymbol = "TEQT";
        string[] memory classes = new string[](3);
        classes[0] = "Common";
        classes[1] = "Preferred";
        classes[2] = "Restricted";
        string[] memory categories = new string[](3);
        categories[0] = "Series A";
        categories[1] = "Series B";
        categories[2] = "Seed";

        for (uint256 i = 0; i < 3; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.createToken(name, symbol, classes[i], categories[i], owner);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            Equity token = Equity(tokenAddress);
            assertEq(token.equityClass(), classes[i], "Token class should match");
            assertEq(token.equityCategory(), categories[i], "Token category should match");
        }

        assertEq(factory.allTokensLength(), 3, "Should have created three tokens");
    }

    function test_RevertWhenZeroAddress() public {
        vm.expectRevert(EquityFactory.ZeroAddress.selector);
        factory.createToken("Test Equity", "TEQT", "Common", "Series A", address(0));
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address token1 = factory.createToken(name, symbol, class, category, owner);

        // Create a new factory instance
        EquityFactory newFactory = new EquityFactory();

        // Create a token with the same parameters
        address token2 = newFactory.createToken(name, symbol, class, category, owner);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address tokenAddress = factory.createToken(name, symbol, class, category, owner);
        Equity token = Equity(tokenAddress);

        // Test initial state
        assertFalse(token.paused(), "Token should not be paused initially");
        assertEq(token.totalSupply(), 0, "Initial supply should be zero");
        assertEq(token.getVotes(owner), 0, "Initial voting power should be zero");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address tokenAddress = factory.createToken(name, symbol, class, category, owner);
        Equity token = Equity(tokenAddress);

        // Test minting
        uint256 amount = 1000 ether;
        vm.prank(owner);
        token.mint(owner, amount);
        assertEq(token.balanceOf(owner), amount, "Balance should match minted amount");

        // Delegate voting power to self
        vm.prank(owner);
        token.delegate(owner);
        assertEq(token.getVotes(owner), amount, "Voting power should match balance after delegation");

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
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        vm.recordLogs();
        address tokenAddress = factory.createToken(name, symbol, class, category, owner);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 2, "Should emit 2 events: OwnershipTransferred and EquityCreated");

        // The last event should be EquityCreated
        VmSafe.Log memory lastEntry = entries[1];

        // Topic 0 is the event signature
        assertEq(
            lastEntry.topics[0],
            keccak256("EquityCreated(address,string,string,string,string,address,uint256)"),
            "Wrong event signature"
        );

        // Topic 1 is the first indexed parameter (token address)
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");

        // Topic 2 is the second indexed parameter (owner address)
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), owner, "Wrong owner address in event");
    }
}
