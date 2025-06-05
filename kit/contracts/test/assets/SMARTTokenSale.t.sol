// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { SMARTTokenSaleTestable } from "../mocks/SMARTTokenSaleTestable.sol";
import { SMARTTokenSaleProxy } from "../../contracts/assets/token-sale/SMARTTokenSaleProxy.sol";
import { SMARTTokenSaleFactoryTestable } from "../mocks/SMARTTokenSaleFactoryTestable.sol";
import { ISMARTTokenSale } from "../../contracts/assets/token-sale/ISMARTTokenSale.sol";
import { MockedSMARTToken } from "../mocks/MockedSMARTToken.sol";
import { MockedERC20Token } from "../utils/mocks/MockedERC20Token.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract SMARTTokenSaleTest is Test {
    // --- Test Constants ---
    uint256 constant SALE_DURATION = 30 days;
    uint256 constant HARD_CAP = 1_000_000 * 1e18; // 1M tokens
    uint256 constant BASE_PRICE = 1e15; // 0.001 ETH per token
    uint256 constant MIN_PURCHASE = 100 * 1e18; // 100 tokens
    uint256 constant MAX_PURCHASE = 10_000 * 1e18; // 10k tokens
    uint256 constant VESTING_DURATION = 365 days;
    uint256 constant VESTING_CLIFF = 90 days;
    uint256 constant USDC_PRICE_RATIO = 1e15; // 0.001 USDC per token (with USDC having 6 decimals)

    // --- Test Contracts ---
    SMARTTokenSaleTestable tokenSaleImpl;
    SMARTTokenSaleProxy tokenSaleProxy;
    SMARTTokenSaleFactoryTestable tokenSaleFactory;
    ISMARTTokenSale tokenSale;
    MockedSMARTToken token;
    MockedERC20Token usdc;

    // --- Test Accounts ---
    address admin;
    address fundsManager;
    address buyer1;
    address buyer2;
    address buyer3;
    address nonEligibleBuyer;

    // --- Events ---
    event TokensPurchased(
        address indexed buyer, address indexed paymentCurrency, uint256 paymentAmount, uint256 tokenAmount
    );
    event TokensWithdrawn(address indexed buyer, uint256 amount);
    event SaleStatusUpdated(uint8 newStatus);
    event SaleParametersUpdated(address indexed operator);
    event FundsWithdrawn(address indexed recipient, address indexed currency, uint256 amount);
    event PaymentCurrencyAdded(address indexed currency, uint256 priceRatio);
    event PaymentCurrencyRemoved(address indexed currency);

    function setUp() public {
        // Minimal setup without SMART ecosystem to avoid ERC2771Context issues
        admin = makeAddr("Admin");
        fundsManager = makeAddr("FundsManager");
        buyer1 = makeAddr("Buyer1");
        buyer2 = makeAddr("Buyer2");
        buyer3 = makeAddr("Buyer3");
        nonEligibleBuyer = makeAddr("NonEligibleBuyer");

        // Deploy USDC mock
        usdc = new MockedERC20Token("USD Coin", "USDC", 6);

        // Deploy token sale implementation and factory using testable versions
        tokenSaleImpl = new SMARTTokenSaleTestable();

        // Deploy factory directly as testable version (no proxy for tests)
        tokenSaleFactory = new SMARTTokenSaleFactoryTestable();

        // Initialize factory directly with admin
        vm.prank(admin);
        tokenSaleFactory.initialize(address(tokenSaleImpl));

        // Create a simple mock token for testing that doesn't require the full SMART ecosystem
        token = new MockedSMARTToken();

        // Deploy token sale through factory
        uint256 saleStart = block.timestamp + 1 hours;

        // Group all admin operations together
        vm.startPrank(admin);
        address tokenSaleAddress = tokenSaleFactory.deployTokenSale(
            address(token),
            admin, // saleAdmin
            saleStart,
            SALE_DURATION,
            HARD_CAP,
            BASE_PRICE,
            0 // saltNonce
        );
        tokenSale = ISMARTTokenSale(tokenSaleAddress);

        // Grant roles
        IAccessControl(address(tokenSale)).grantRole(keccak256("FUNDS_MANAGER_ROLE"), fundsManager);

        // Fund the token sale contract with tokens
        token.mint(address(tokenSale), HARD_CAP);
        vm.stopPrank();

        // Fund test accounts
        vm.deal(buyer1, 100 ether);
        vm.deal(buyer2, 100 ether);
        vm.deal(buyer3, 100 ether);
        vm.deal(nonEligibleBuyer, 100 ether);

        // Fund test accounts with USDC
        usdc.mint(buyer1, 1_000_000 * 1e6); // 1M USDC
        usdc.mint(buyer2, 1_000_000 * 1e6);
        usdc.mint(buyer3, 1_000_000 * 1e6);
    }

    // --- Initialization Tests ---

    function test_Initialize_Success() public {
        // Check initial state
        assertEq(address(tokenSale.token()), address(token));
        assertEq(tokenSale.hardCap(), HARD_CAP);
        assertEq(tokenSale.basePrice(), BASE_PRICE);
        assertEq(tokenSale.totalSold(), 0);
        assertEq(tokenSale.saleStatus(), 0); // SaleStatus.SETUP
    }

    // --- Helper Functions ---

    function _activateSaleAndMoveToStart() internal {
        vm.prank(admin);
        tokenSale.activateSale();

        // Move to sale start time
        vm.warp(block.timestamp + 1 hours);
    }

    function _configureVestingAndPurchase() internal returns (uint256 tokenAmount) {
        // Configure vesting
        uint256 vestingStart = block.timestamp;
        vm.prank(admin);
        tokenSale.configureVesting(vestingStart, VESTING_DURATION, VESTING_CLIFF);

        _activateSaleAndMoveToStart();

        // Make a purchase
        uint256 ethAmount = 1 ether;
        vm.prank(buyer1);
        tokenAmount = tokenSale.buyTokens{ value: ethAmount }();

        // Verify tokens are not immediately transferred due to vesting
        assertEq(token.balanceOf(buyer1), 0);
        assertEq(tokenSale.purchasedAmount(buyer1), tokenAmount);

        return tokenAmount;
    }
}
