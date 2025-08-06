// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { ISMARTCollateral } from "../../../contracts/smart/extensions/collateral/ISMARTCollateral.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

abstract contract SMARTCollateralTest is AbstractSMARTTest {
    uint256 internal constant COLLATERAL_AMOUNT = 1_000_000 ether; // Example collateral amount
    uint256 internal constant MINT_AMOUNT = 100 ether;

    // --- Test Cases ---

    function test_Collateral_Mint_Success_WithValidCollateralClaim() public {
        // 1. Issue a valid collateral claim to the token's identity
        uint256 expiry = block.timestamp + 1 days;
        claimUtils.issueCollateralClaim(address(token), tokenIssuer, COLLATERAL_AMOUNT, expiry);

        // 2. Mint tokens (amount <= collateral)
        // _mintInitialBalances(); // Avoid calling this here as it might interfere with collateral logic
        uint256 initialSupply = token.totalSupply();
        require(initialSupply + MINT_AMOUNT <= COLLATERAL_AMOUNT, "Test setup error: mint amount exceeds collateral");

        uint256 balBESnap = token.balanceOf(clientBE);
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, MINT_AMOUNT); // Using TokenUtils for consistency

        // 3. Verify mint succeeded
        assertEq(token.balanceOf(clientBE), balBESnap + MINT_AMOUNT, "Balance wrong after mint");
        assertEq(token.totalSupply(), initialSupply + MINT_AMOUNT, "Total supply wrong after mint");
    }

    function test_Collateral_Mint_Fail_InsufficientCollateral() public {
        // 1. Issue a collateral claim with an amount LESS than the intended mint amount
        uint256 insufficientCollateral = MINT_AMOUNT / 2;
        uint256 expiry = block.timestamp + 1 days;
        claimUtils.issueCollateralClaim(address(token), tokenIssuer, insufficientCollateral, expiry);

        // 2. Attempt to mint tokens (amount > collateral)
        uint256 currentSupply = token.totalSupply(); // Could be 0
        uint256 requiredSupply = currentSupply + MINT_AMOUNT;

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTCollateral.InsufficientCollateral.selector, requiredSupply, insufficientCollateral
            )
        );
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, MINT_AMOUNT);
    }

    function test_Collateral_Mint_Success_MultipleMintsWithinLimit() public {
        // 1. Issue a valid collateral claim
        uint256 expiry = block.timestamp + 1 days;
        claimUtils.issueCollateralClaim(address(token), tokenIssuer, COLLATERAL_AMOUNT, expiry);

        // 2. Mint first batch
        uint256 mintAmount1 = COLLATERAL_AMOUNT / 4;
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount1);
        uint256 supplyAfter1 = token.totalSupply();
        assertEq(supplyAfter1, mintAmount1, "Supply 1 mismatch");

        // 3. Mint second batch (total <= collateral)
        uint256 mintAmount2 = COLLATERAL_AMOUNT / 4;
        require(supplyAfter1 + mintAmount2 <= COLLATERAL_AMOUNT, "Test setup error: mint 2 exceeds collateral");
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, mintAmount2); // Mint to different client
        uint256 supplyAfter2 = token.totalSupply();
        assertEq(supplyAfter2, supplyAfter1 + mintAmount2, "Supply 2 mismatch");
    }

    function test_Collateral_Mint_Fail_MultipleMintsExceedLimit() public {
        // 1. Issue a valid collateral claim
        uint256 specificCollateral = 500 ether;
        uint256 expiry = block.timestamp + 1 days;
        claimUtils.issueCollateralClaim(address(token), tokenIssuer, specificCollateral, expiry);

        // 2. Mint first batch (within limit)
        uint256 mintAmount1 = specificCollateral / 2;
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount1);
        uint256 supplyAfter1 = token.totalSupply();

        // 3. Attempt to mint second batch (total > collateral)
        uint256 mintAmount2 = specificCollateral / 2 + 1 ether; // Exceeds limit
        uint256 requiredSupply = supplyAfter1 + mintAmount2;

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCollateral.InsufficientCollateral.selector, requiredSupply, specificCollateral)
        );
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, mintAmount2);
    }

    function test_Collateral_Mint_Fail_ExpiredCollateralClaim() public {
        // 1. Issue a collateral claim with an expiry slightly in the future
        uint256 futureExpiry = block.timestamp + 1 hours; // Set expiry 1 hour from now
        claimUtils.issueCollateralClaim(address(token), tokenIssuer, COLLATERAL_AMOUNT, futureExpiry);

        // 2. Advance time past the expiry date using vm.warp
        vm.warp(futureExpiry + 1); // Advance time to 1 second after expiry

        // 3. Attempt to mint tokens - the claim should now be expired
        uint256 currentSupply = token.totalSupply();
        uint256 requiredSupply = currentSupply + MINT_AMOUNT;

        // Expect revert because findValidCollateralClaim returns 0 for expired claims
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCollateral.InsufficientCollateral.selector, requiredSupply, 0) // Available
                // collateral is 0
        );
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, MINT_AMOUNT);
    }

    function test_Collateral_Mint_Fail_NoCollateralClaim() public {
        // 1. Do NOT issue any collateral claim

        // 2. Attempt to mint tokens
        uint256 currentSupply = token.totalSupply();
        uint256 requiredSupply = currentSupply + MINT_AMOUNT;

        // Expect revert because findValidCollateralClaim returns 0
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCollateral.InsufficientCollateral.selector, requiredSupply, 0) // Available
                // collateral is 0
        );
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, MINT_AMOUNT);
    }

    function test_Collateral_Mint_Fail_UntrustedIssuer() public {
        // Setup an untrusted issuer
        uint256 untrustedIssuerPK = 0xBAD155;
        address untrustedIssuerWallet = vm.addr(untrustedIssuerPK);
        vm.label(untrustedIssuerWallet, "Untrusted Issuer Wallet");

        // Deploy identity + add management key controlled by the wallet itself
        address untrustedIssuerIdentityAddr = identityUtils.createIdentity(untrustedIssuerWallet);
        vm.label(untrustedIssuerIdentityAddr, "Untrusted Issuer Identity");

        // Create a temporary ClaimUtils for the untrusted issuer
        ClaimUtils untrustedClaimUtils = new ClaimUtils(
            platformAdmin,
            untrustedIssuerWallet,
            untrustedIssuerPK,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );

        uint256 expiry = block.timestamp + 1 days;

        // Create the claim signature using the untrusted utils
        untrustedClaimUtils.issueCollateralClaim(address(token), tokenIssuer, COLLATERAL_AMOUNT, expiry);

        // Attempt to mint tokens
        uint256 currentSupply = token.totalSupply();
        uint256 requiredSupply = currentSupply + MINT_AMOUNT;

        // Expect revert because the issuer (untrustedIssuerIdentityAddr) isn't in the trusted list for COLLATERAL_TOPIC
        // findValidCollateralClaim will iterate issuers, find the claim, but see it's not from a trusted source for the
        // topic.
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTCollateral.InsufficientCollateral.selector, requiredSupply, 0) // Available
                // collateral is 0
        );
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, MINT_AMOUNT);
    }

    function test_SupportsInterface_Collateral() public {
        // Note: Collateral tests often don't call super.setUp() in each test
        // but rely on the inherited setUp from SMARTTest if it's sufficient
        // or have specific setups. For interface check, a basic setup is fine.
        super.setUp(); // Ensure basic token deployment
        _setupDefaultCollateralClaim(); // Ensure collateral state is as expected for collateral functionality if needed

        assertTrue(
            IERC165(address(token)).supportsInterface(type(ISMARTCollateral).interfaceId),
            "Token does not support ISMARTCollateral interface"
        );
    }
}
