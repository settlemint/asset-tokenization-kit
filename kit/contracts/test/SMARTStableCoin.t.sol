// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SMARTStableCoin } from "../contracts/SMARTStableCoin.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { SMARTConstants } from "../contracts/SMARTConstants.sol";
import { TestConstants } from "./TestConstants.sol";
import { InvalidDecimals } from "smart-protocol/contracts/extensions/core/SMARTErrors.sol";
import { ClaimUtils } from "smart-protocol/test/utils/ClaimUtils.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { InsufficientCollateral } from "smart-protocol/contracts/extensions/collateral/SMARTCollateralErrors.sol";
import { SMARTUtils } from "./utils/SMARTUtils.sol";

/// Following tests are changed:
/// - test_BurnFrom: removed because it doesn't exist in ERC3643
/// - test_OnlyUserManagementCanBlock: removed because it will be managed by compliance modules
/// - test_OnlyAdminCanUpdateCollateral: renamed to test_OnlyTrustedIssuerCanUpdateCollateral
/// - test_StableCoinClawback: renamed to test_StableCoinForceTransfer
/// - test_onlySupplyManagementCanClawback: renamed to test_onlySupplyManagementCanForceTransfer
contract SMARTStableCoinTest is Test {
    SMARTUtils internal smartUtils;

    // extract these so that these are not seen as an extra call to smartUtils contract when expecting a revert
    address public identityRegistry;
    address public compliance;

    SMARTStableCoin public stableCoin;
    Forwarder public forwarder;

    address public owner;
    address public user1;
    address public user2;
    address public spender;

    uint8 public constant DECIMALS = 8;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** DECIMALS;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        smartUtils = new SMARTUtils();
        identityRegistry = address(smartUtils.identityRegistry());
        compliance = address(smartUtils.compliance());

        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        // Initialize identities
        address[] memory identities = new address[](4);
        identities[0] = owner;
        identities[1] = user1;
        identities[2] = user2;
        identities[3] = spender;
        smartUtils.setUpIdentities(identities);

        // Deploy forwarder first
        forwarder = new Forwarder();

        stableCoin =
            _createStableCoin("StableCoin", "STBL", DECIMALS, new uint256[](0), new SMARTComplianceModuleParamPair[](0));
        vm.label(address(stableCoin), "StableCoin");
    }

    function _createStableCoin(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256[] memory requiredClaimTopics,
        SMARTComplianceModuleParamPair[] memory initialModulePairs
    )
        internal
        returns (SMARTStableCoin)
    {
        vm.startPrank(owner);
        SMARTStableCoin stableCoin_ = new SMARTStableCoin(
            name,
            symbol,
            decimals,
            address(0),
            requiredClaimTopics,
            initialModulePairs,
            identityRegistry,
            compliance,
            owner,
            address(forwarder)
        );
        vm.stopPrank();

        smartUtils.createAndSetTokenOnchainID(address(stableCoin_), owner);

        return stableCoin_;
    }

    function _updateCollateral(address token, address tokenIssuer, uint256 collateralAmount) internal {
        // Use a very large amount and a long expiry
        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        vm.startPrank(tokenIssuer);
        smartUtils.issueCollateralClaim(address(token), tokenIssuer, collateralAmount, farFutureExpiry);
        vm.stopPrank();
    }

    function _mintInitialSupply(address recipient) internal {
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
        vm.startPrank(owner);
        stableCoin.mint(recipient, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(stableCoin.name(), "StableCoin");
        assertEq(stableCoin.symbol(), "STBL");
        assertEq(stableCoin.decimals(), DECIMALS);
        assertEq(stableCoin.totalSupply(), 0);
        assertTrue(stableCoin.hasRole(stableCoin.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(stableCoin.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(stableCoin.hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            SMARTStableCoin newToken = _createStableCoin(
                "StableCoin", "STBL", decimalValues[i], new uint256[](0), new SMARTComplianceModuleParamPair[](0)
            );
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.expectRevert(abi.encodeWithSelector(InvalidDecimals.selector, 19));
        new SMARTStableCoin(
            "StableCoin",
            "STBL",
            19,
            address(0),
            new uint256[](0),
            new SMARTComplianceModuleParamPair[](0),
            identityRegistry,
            compliance,
            owner,
            address(forwarder)
        );
    }

    function test_OnlySupplyManagementCanMint() public {
        _mintInitialSupply(user1);

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(stableCoin.totalSupply(), INITIAL_SUPPLY);

        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY + 100);

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, SMARTConstants.SUPPLY_MANAGEMENT_ROLE
            )
        );
        stableCoin.mint(user1, 100);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        stableCoin.grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1);
        assertTrue(stableCoin.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1));

        stableCoin.revokeRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1);
        assertFalse(stableCoin.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1));
        vm.stopPrank();
    }

    // ERC20Burnable tests
    function test_Burn() public {
        _mintInitialSupply(user1);

        vm.startPrank(owner);
        stableCoin.burn(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, stableCoin.DEFAULT_ADMIN_ROLE()
            )
        );
        stableCoin.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.pause();
        vm.stopPrank();

        assertTrue(stableCoin.paused());
    }

    function test_OnlyTrustedIssuerCanUpdateCollateral() public {
        uint256 collateralAmount = 1_000_000;

        // Setup an untrusted issuer
        uint256 untrustedIssuerPK = 0xBAD155;
        address untrustedIssuerWallet = vm.addr(untrustedIssuerPK);
        vm.label(untrustedIssuerWallet, "Untrusted Issuer Wallet");
        ClaimUtils untrustedClaimUtils = smartUtils.createClaimUtilsForIssuer(untrustedIssuerWallet, untrustedIssuerPK);
        smartUtils.createIdentity(untrustedIssuerWallet);

        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        vm.startPrank(untrustedIssuerWallet);
        untrustedClaimUtils.issueCollateralClaim(address(stableCoin), owner, collateralAmount, farFutureExpiry);
        vm.stopPrank();

        // Declare variables the first time
        (uint256 amount, address claimIssuer, uint256 timestamp) = stableCoin.findValidCollateralClaim();
        assertEq(amount, 0); // Check initial state (untrusted issuer)

        // Expect mint to revert due to insufficient collateral
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(InsufficientCollateral.selector, 100, 0)); // Assuming mint amount is 100
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        // Issue claim from the trusted issuer (owner)
        smartUtils.issueCollateralClaim(address(stableCoin), owner, collateralAmount, farFutureExpiry);

        // Assign new values to existing variables (no type declaration)
        (amount, claimIssuer, timestamp) = stableCoin.findValidCollateralClaim();
        assertEq(amount, collateralAmount); // Check updated state (trusted issuer)

        vm.startPrank(owner);
        stableCoin.mint(user1, 100);
        vm.stopPrank();
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);

        vm.startPrank(owner);
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, SMARTConstants.USER_MANAGEMENT_ROLE
            )
        );
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 100);

        vm.startPrank(user1);
        vm.expectRevert();
        stableCoin.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.unfreezePartialTokens(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 0);
    }

    // ERC20Permit tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);
        vm.label(signer, "Signer Wallet");

        smartUtils.setUpIdentity(signer);

        _mintInitialSupply(signer);

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = stableCoin.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = stableCoin.DOMAIN_SEPARATOR();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            privateKey,
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            signer,
                            spender,
                            100,
                            nonce,
                            deadline
                        )
                    )
                )
            )
        );

        stableCoin.permit(signer, spender, 100, deadline, v, r, s);
        assertEq(stableCoin.allowance(signer, spender), 100);
    }

    // Transfer and approval tests
    function test_TransferAndApproval() public {
        _mintInitialSupply(user1);

        vm.prank(user1);
        stableCoin.approve(spender, 100);
        assertEq(stableCoin.allowance(user1, spender), 100);

        vm.prank(spender);
        stableCoin.transferFrom(user1, user2, 50);
        assertEq(stableCoin.balanceOf(user2), 50);
        assertEq(stableCoin.allowance(user1, spender), 50);
    }

    function test_StableCoinForcedTransfer() public {
        _mintInitialSupply(user1);

        vm.startPrank(owner);
        stableCoin.forcedTransfer(user1, user2, INITIAL_SUPPLY);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), 0);
        assertEq(stableCoin.balanceOf(user2), INITIAL_SUPPLY);
    }

    function test_onlySupplyManagementCanForceTransfer() public {
        _mintInitialSupply(user1);

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, SMARTConstants.SUPPLY_MANAGEMENT_ROLE
            )
        );
        stableCoin.forcedTransfer(user1, user2, INITIAL_SUPPLY);
        vm.stopPrank();
    }
}
