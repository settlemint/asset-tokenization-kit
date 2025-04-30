// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { SMARTStableCoin } from "../contracts/SMARTStableCoin.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { SMARTConstants } from "../contracts/SMARTConstants.sol";
import { TestConstants } from "./TestConstants.sol";
import { InvalidDecimals } from "@smartprotocol/contracts/extensions/core/SMARTErrors.sol";
import { InfrastructureUtils } from "@smartprotocol/test-utils/InfrastructureUtils.sol";
import { TokenUtils } from "@smartprotocol/test-utils/TokenUtils.sol";
import { ClaimUtils } from "@smartprotocol/test-utils/ClaimUtils.sol";
import { IdentityUtils } from "@smartprotocol/test-utils/IdentityUtils.sol";
import { SMARTComplianceModuleParamPair } from
    "@smartprotocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { Unauthorized } from "@smartprotocol/contracts/extensions/common/CommonErrors.sol";

contract SMARTStableCoinTest is Test {
    InfrastructureUtils internal infrastructureUtils;
    TokenUtils internal tokenUtils;
    ClaimUtils internal claimUtils;
    IdentityUtils internal identityUtils;

    SMARTStableCoin public stableCoin;
    Forwarder public forwarder;

    uint256 internal claimIssuerPrivateKey = 0x12345;

    address public platformAdmin;
    address public owner;
    address public user1;
    address public user2;
    address public spender;
    address public claimIssuer;

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;
    uint8 public constant DECIMALS = 8;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        // --- Setup platform admin ---
        platformAdmin = makeAddr("Platform Admin");

        infrastructureUtils = new InfrastructureUtils(platformAdmin);
        tokenUtils = new TokenUtils(
            platformAdmin,
            infrastructureUtils.identityFactory(),
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.compliance()
        );
        claimUtils = new ClaimUtils(
            platformAdmin,
            claimIssuer,
            claimIssuerPrivateKey,
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.identityFactory()
        );
        identityUtils = new IdentityUtils(
            platformAdmin,
            infrastructureUtils.identityFactory(),
            infrastructureUtils.identityRegistry(),
            infrastructureUtils.trustedIssuersRegistry()
        );

        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // Initialize the claim issuer
        uint256[] memory claimTopics = new uint256[](2);
        claimTopics[0] = TestConstants.CLAIM_TOPIC_KYC;
        claimTopics[1] = SMARTConstants.CLAIM_TOPIC_COLLATERAL;
        // Use claimIssuer address directly, createIssuerIdentity handles creating the on-chain identity
        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, claimTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");

        // Initialize identities
        identityUtils.createClientIdentity(owner, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueInvestorClaim(owner, TestConstants.CLAIM_TOPIC_KYC, "Verified KYC by Issuer");
        identityUtils.createClientIdentity(user1, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueInvestorClaim(user1, TestConstants.CLAIM_TOPIC_KYC, "Verified KYC by Issuer");
        identityUtils.createClientIdentity(user2, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueInvestorClaim(user2, TestConstants.CLAIM_TOPIC_KYC, "Verified KYC by Issuer");
        identityUtils.createClientIdentity(spender, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueInvestorClaim(spender, TestConstants.CLAIM_TOPIC_KYC, "Verified KYC by Issuer");

        // Deploy forwarder first
        forwarder = new Forwarder();

        vm.startPrank(owner);
        stableCoin = _createStableCoin(
            "StableCoin", "STBL", DECIMALS, address(0), new uint256[](0), new SMARTComplianceModuleParamPair[](0), owner
        );
        vm.stopPrank();
    }

    function _createStableCoin(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address onchainID,
        uint256[] memory requiredClaimTopics,
        SMARTComplianceModuleParamPair[] memory initialModulePairs,
        address owner_
    )
        internal
        returns (SMARTStableCoin)
    {
        vm.startPrank(owner_);
        SMARTStableCoin stableCoin_ = new SMARTStableCoin(
            name,
            symbol,
            decimals,
            onchainID,
            requiredClaimTopics,
            initialModulePairs,
            address(infrastructureUtils.identityRegistry()),
            address(infrastructureUtils.compliance()),
            owner_,
            address(forwarder)
        );
        vm.stopPrank();

        tokenUtils.createAndSetTokenOnchainID(address(stableCoin), owner_);

        return stableCoin_;
    }

    function _updateCollateral(address token, address tokenIssuer, uint256 collateralAmount) internal {
        // Use a very large amount and a long expiry
        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        claimUtils.issueCollateralClaim(address(token), tokenIssuer, collateralAmount, farFutureExpiry);
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
            vm.startPrank(owner);
            SMARTStableCoin newToken = _createStableCoin(
                "StableCoin",
                "STBL",
                decimalValues[i],
                address(0),
                new uint256[](0),
                new SMARTComplianceModuleParamPair[](0),
                owner
            );
            vm.stopPrank();
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(InvalidDecimals.selector, 19));
        _createStableCoin(
            "StableCoin", "STBL", 19, address(0), new uint256[](0), new SMARTComplianceModuleParamPair[](0), owner
        );
        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        vm.startPrank(owner);
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(stableCoin.totalSupply(), INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, SMARTConstants.SUPPLY_MANAGEMENT_ROLE
            )
        );
        stableCoin.mint(user1, INITIAL_SUPPLY);
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
        vm.startPrank(owner);
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.burn(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // function test_BurnFrom() public {
    //     vm.startPrank(owner);
    //     _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
    //     stableCoin.mint(user1, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     vm.startPrank(user1);
    //     stableCoin.approve(spender, 100);
    //     vm.stopPrank();

    //     vm.startPrank(spender);
    //     stableCoin.burn(user1, 100);
    //     vm.stopPrank();

    //     assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    // }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSelector(Unauthorized.selector, user1, stableCoin.DEFAULT_ADMIN_ROLE()));
        stableCoin.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.pause();
        vm.stopPrank();

        assertTrue(stableCoin.paused());
    }

    // // ERC20Blocklist tests
    // function test_OnlyUserManagementCanBlock() public {
    //     vm.startPrank(owner);
    //     _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
    //     stableCoin.mint(user1, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     vm.startPrank(user2);
    //     vm.expectRevert(abi.encodeWithSelector(Unauthorized.selector, user2, SMARTConstants.USER_MANAGEMENT_ROLE));
    //     stableCoin.blockUser(user1);
    //     vm.stopPrank();

    //     vm.startPrank(owner);
    //     stableCoin.blockUser(user1);
    //     vm.stopPrank();

    //     assertTrue(stableCoin.blocked(user1));

    //     vm.startPrank(user1);
    //     vm.expectRevert();
    //     stableCoin.transfer(user2, 100);
    //     vm.stopPrank();

    //     vm.startPrank(owner);
    //     stableCoin.unblockUser(user1);
    //     vm.stopPrank();

    //     assertFalse(stableCoin.blocked(user1));

    //     vm.startPrank(user1);
    //     stableCoin.transfer(user2, 100);
    //     vm.stopPrank();

    //     assertEq(stableCoin.balanceOf(user2), 100);
    // }

    // ERC20Collateral tests
    // function test_OnlyAdminCanUpdateCollateral() public {
    //     uint256 collateralAmount = 1_000_000;

    //     bytes32 role = stableCoin.AUDITOR_ROLE();
    //     vm.startPrank(user1);
    //     vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
    //     stableCoin.updateCollateral(collateralAmount);
    //     vm.stopPrank();

    //     vm.startPrank(owner);
    //     stableCoin.updateCollateral(collateralAmount);
    //     vm.stopPrank();

    //     (uint256 amount, uint48 timestamp) = stableCoin.collateral();
    //     assertEq(amount, collateralAmount);
    //     assertEq(timestamp, uint48(block.timestamp));
    // }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.startPrank(owner);
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("ERC20NotCustodian()"));
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 200);

        vm.startPrank(user1);
        vm.expectRevert();
        stableCoin.freezePartialTokens(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.unfreezePartialTokens(user1, 200);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 0);
    }

    // ERC20Permit tests
    // function test_Permit() public {
    //     uint256 privateKey = 0xA11CE;
    //     address signer = vm.addr(privateKey);

    //     vm.startPrank(owner);
    //     stableCoin.updateCollateral(INITIAL_SUPPLY);
    //     stableCoin.mint(signer, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     uint256 deadline = block.timestamp + 1 hours;
    //     uint256 nonce = stableCoin.nonces(signer);

    //     bytes32 DOMAIN_SEPARATOR = stableCoin.DOMAIN_SEPARATOR();

    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(
    //         privateKey,
    //         keccak256(
    //             abi.encodePacked(
    //                 "\x19\x01",
    //                 DOMAIN_SEPARATOR,
    //                 keccak256(
    //                     abi.encode(
    //                         keccak256(
    //                             "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    //                         ),
    //                         signer,
    //                         spender,
    //                         100,
    //                         nonce,
    //                         deadline
    //                     )
    //                 )
    //             )
    //         )
    //     );

    //     stableCoin.permit(signer, spender, 100, deadline, v, r, s);
    //     assertEq(stableCoin.allowance(signer, spender), 100);
    // }

    // // Transfer and approval tests
    // function test_TransferAndApproval() public {
    //     vm.startPrank(owner);
    //     stableCoin.updateCollateral(INITIAL_SUPPLY);
    //     stableCoin.mint(user1, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     vm.prank(user1);
    //     stableCoin.approve(spender, 100);
    //     assertEq(stableCoin.allowance(user1, spender), 100);

    //     vm.prank(spender);
    //     stableCoin.transferFrom(user1, user2, 50);
    //     assertEq(stableCoin.balanceOf(user2), 50);
    //     assertEq(stableCoin.allowance(user1, spender), 50);
    // }

    // function test_StableCoinClawback() public {
    //     vm.startPrank(owner);
    //     stableCoin.updateCollateral(INITIAL_SUPPLY);
    //     stableCoin.mint(user1, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     vm.startPrank(owner);
    //     stableCoin.clawback(user1, user2, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     assertEq(stableCoin.balanceOf(user1), 0);
    //     assertEq(stableCoin.balanceOf(user2), INITIAL_SUPPLY);
    // }

    // function test_onlySupplyManagementCanClawback() public {
    //     vm.startPrank(owner);
    //     stableCoin.updateCollateral(INITIAL_SUPPLY);
    //     stableCoin.mint(user1, INITIAL_SUPPLY);
    //     vm.stopPrank();

    //     vm.startPrank(user2);
    //     vm.expectRevert(
    //         abi.encodeWithSignature(
    //             "AccessControlUnauthorizedAccount(address,bytes32)", user2, stableCoin.SUPPLY_MANAGEMENT_ROLE()
    //         )
    //     );
    //     stableCoin.clawback(user1, user2, INITIAL_SUPPLY);
    //     vm.stopPrank();
    // }
}
