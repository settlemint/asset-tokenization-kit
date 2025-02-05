// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { FundFactory } from "../contracts/FundFactory.sol";
import { Fund } from "../contracts/Fund.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract FundFactoryTest is Test {
    FundFactory public factory;
    Forwarder public forwarder;
    address public owner;
    address public user1;
    address public user2;
    uint8 public constant DECIMALS = 8;
    uint256 public constant INITIAL_SUPPLY = 1_000_000;

    // Constants for fund creation
    string constant NAME = "Test Fund";
    string constant SYMBOL = "TFUND";
    string constant ISIN = "US0378331005";
    uint16 constant MANAGEMENT_FEE_BPS = 200; // 2%
    string constant FUND_CLASS = "Hedge Fund";
    string constant FUND_CATEGORY = "Long/Short Equity";

    event FundCreated(address indexed token);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new FundFactory(address(forwarder));
    }

    function test_CreateFund() public {
        vm.startPrank(owner);

        address predictedAddress =
            factory.predictAddress(owner, NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        vm.expectEmit(true, false, false, false);
        emit FundCreated(predictedAddress);

        address fundAddress =
            factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        assertEq(fundAddress, predictedAddress);
        assertTrue(factory.isFactoryFund(fundAddress));

        Fund fund = Fund(fundAddress);
        assertEq(fund.name(), NAME);
        assertEq(fund.symbol(), SYMBOL);
        assertEq(fund.decimals(), DECIMALS);
        assertEq(fund.isin(), ISIN);
        assertEq(fund.fundClass(), FUND_CLASS);
        assertEq(fund.fundCategory(), FUND_CATEGORY);
        assertTrue(fund.hasRole(fund.DEFAULT_ADMIN_ROLE(), owner));

        vm.stopPrank();
    }

    function test_CreateFund_DuplicateAddress() public {
        vm.startPrank(owner);

        // Create first fund
        factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        // Try to create duplicate fund
        vm.expectRevert(FundFactory.AddressAlreadyDeployed.selector);
        factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        vm.stopPrank();
    }

    function test_PredictAddress() public {
        vm.startPrank(owner);

        address predicted =
            factory.predictAddress(owner, NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        address actual = factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS);

        assertEq(actual, predicted);

        // Predict address with different parameters
        address predicted2 = factory.predictAddress(
            owner, "Different Fund", "DFUND", DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS
        );

        assertTrue(predicted2 != predicted);

        vm.stopPrank();
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Fund";
        string memory symbol = "TFUND";
        string memory fundClass = "Hedge Fund";
        string memory fundCategory = "Long/Short Equity";

        address token1 = factory.create(name, symbol, DECIMALS, ISIN, fundClass, fundCategory, MANAGEMENT_FEE_BPS);

        // Create a new factory instance
        FundFactory newFactory = new FundFactory(address(forwarder));

        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, DECIMALS, ISIN, fundClass, fundCategory, MANAGEMENT_FEE_BPS);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }
}
