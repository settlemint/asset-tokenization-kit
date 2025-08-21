// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTIdentityRegistry } from "../../../interface/ISMARTIdentityRegistry.sol";
import { IERC3643TrustedIssuersRegistry } from "../../../interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { ISMARTCollateral } from "../ISMARTCollateral.sol";

/// @title Internal Logic for SMART Collateral Extension
/// @author SettleMint
/// @notice This abstract contract encapsulates the core, shared logic for verifying a global
/// collateral
///         claim on the token contract's own OnchainID identity before allowing token minting.
///         It is not meant for direct deployment but serves as a base for both standard (`SMARTCollateral`)
///         and upgradeable (`SMARTCollateralUpgradeable`) collateral extensions.
/// @dev It provides the `findValidCollateralClaim` function to locate and validate the collateral claim,
///      and the `__collateral_beforeMintLogic` hook that uses this function to enforce the collateral requirement.
///      This contract expects inheriting contracts (or the final token contract) to provide implementations for:
///      - `this.identityRegistry()`: To get the `ISMARTIdentityRegistry`.
///      - `this.onchainID()`: To get the address of the token contract's own `IIdentity` contract.
///      - `this.totalSupply()`: To get the current total supply of the token.
///      The collateral proof topic ID is stored and used to filter relevant claims.

abstract contract _SMARTCollateralLogic is _SMARTExtension, ISMARTCollateral {
    // -- State Variables --

    /// @notice The ERC-735 claim topic ID that represents the required collateral proof.
    /// @dev This ID is used to specifically look up claims related to collateral on an OnchainID identity contract.
    ///      It is set during initialization and is `private`, meaning it's only directly accessible within this
    /// contract.
    uint256 private collateralProofTopic;

    /// @notice Abstract internal function to get the current total supply of tokens.
    /// @dev This function MUST be implemented by any concrete contract that inherits `_SMARTCappedLogic`
    ///      (e.g., `SMARTCapped` or `SMARTCappedUpgradeable`). The implementation will typically
    ///      call the `totalSupply()` function of the base ERC20 or ERC20Upgradeable contract.
    ///      `internal view virtual` means:
    ///      - `internal`: Callable only within this contract and derived contracts.
    ///      - `view`: Does not modify state.
    ///      - `virtual`: Signifies that this abstract function is intended to be implemented/overridden.
    /// @return uint256 The current total number of tokens in existence.
    function __collateral_totalSupply() internal view virtual returns (uint256);

    // -- Internal Setup Function --

    /// @notice Internal unchained initializer for the collateral logic.
    /// @dev This function is called by the constructors or initializers of inheriting contracts.
    ///      It sets the `collateralProofTopic` state variable. It reverts with `InvalidCollateralTopic`
    ///      if `collateralProofTopic_` is 0, as a zero topic is considered invalid.
    ///      It also registers the `ISMARTCollateral` interface for ERC165 introspection.
    ///      "Unchained" means it doesn't call parent initializers, offering flexibility to the caller.
    /// @param collateralProofTopic_ The `uint256` ID representing the collateral proof claim topic.
    function __SMARTCollateral_init_unchained(uint256 collateralProofTopic_) internal {
        if (collateralProofTopic_ == 0) {
            revert InvalidCollateralTopic(collateralProofTopic_); // Topic ID 0 is not allowed.
        }
        collateralProofTopic = collateralProofTopic_;
        _registerInterface(type(ISMARTCollateral).interfaceId); // Register for ERC165
    }

    // -- View functions --

    /// @notice Attempts to find the first valid collateral claim on the token contract's own identity.
    /// @dev Implements the `ISMARTCollateral` interface function.
    ///      It fetches trusted issuers for the `collateralProofTopic` from the `identityRegistry`.
    ///      Then, it retrieves all claims with this topic from the token's own `onchainID` contract.
    ///      It iterates through these claims, calling `__checkSingleClaim` for each to find the first one
    ///      that is valid, issued by a trusted issuer, not expired, and correctly decodable.
    ///      `virtual` allows this to be overridden in derived contracts if more specific logic is needed.
    /// @inheritdoc ISMARTCollateral
    /// @return amount The collateral amount from the first valid claim found (0 if none).
    /// @return issuer The address of the claim issuer for the first valid claim (address(0) if none).
    /// @return expiryTimestamp The expiry timestamp of the first valid claim (0 if none or expired).
    function findValidCollateralClaim()
        public
        view
        virtual
        override
        returns (uint256 amount, address issuer, uint256 expiryTimestamp)
    {
        // Obtain necessary registry and identity contract instances.
        // Assumes `this.identityRegistry()` and `this.onchainID()` are provided by the inheriting core SMART contract.
        ISMARTIdentityRegistry identityRegistry_ = this.identityRegistry();
        IERC3643TrustedIssuersRegistry issuersRegistry = identityRegistry_.issuersRegistry();
        IIdentity tokenID = IIdentity(this.onchainID()); // The token contract's own identity

        // Get all issuers trusted for the specific collateral proof topic.
        IClaimIssuer[] memory trustedIssuers = issuersRegistry.getTrustedIssuersForClaimTopic(collateralProofTopic);

        // If there are no trusted issuers for this topic, no claim can be valid.
        if (trustedIssuers.length == 0) {
            return (0, address(0), 0); // No trusted issuers, so no valid claim possible.
        }

        // Get all claim IDs on the token's identity contract that match the collateral proof topic.
        bytes32[] memory claimIds = tokenID.getClaimIdsByTopic(collateralProofTopic);

        // Iterate through each claim ID found on the token's identity.
        uint256 claimIdsLength = claimIds.length;
        for (uint256 j = 0; j < claimIdsLength;) {
            // Check this specific claim against the list of trusted issuers.
            (bool validFound, uint256 claimAmount, address claimIssuer, uint256 claimExpiry) =
                __checkSingleClaim(tokenID, claimIds[j], trustedIssuers);

            if (validFound) {
                // First valid claim found, return its details immediately.
                return (claimAmount, claimIssuer, claimExpiry);
            }
            unchecked {
                ++j; // Gas optimization for loop increment.
            }
        }

        // If the loop completes without returning, no valid claim was found.
        return (0, address(0), 0);
    }

    // -- Private Helper Functions --

    /// @notice Checks if a specific claim is currently valid according to its issuer.
    /// @dev This is a low-level helper that calls `isClaimValid` on the `IClaimIssuer` contract.
    ///      It uses a try-catch block to handle potential reverts from the external call (e.g., if the issuer contract
    /// is invalid).
    /// @param issuer The `IClaimIssuer` contract instance to query.
    /// @param tokenIdentity The `IIdentity` contract holding the claim (the token's own identity).
    /// @param claimTopic The topic ID of the claim.
    /// @param signature The signature part of the claim.
    /// @param data The data part of the claim.
    /// @return isValid `true` if the issuer confirms the claim is valid, `false` otherwise or if the call reverts.
    function __checkClaimValidity(
        IClaimIssuer issuer,
        IIdentity tokenIdentity,
        uint256 claimTopic,
        bytes memory signature,
        bytes memory data
    )
        private
        view
        returns (bool isValid)
    {
        try issuer.isClaimValid(tokenIdentity, claimTopic, signature, data) returns (bool valid) {
            return valid; // Return the result from the issuer.
        } catch {
            return false; // If the call to `isClaimValid` reverts, treat the claim as invalid.
        }
    }

    /// @notice Decodes collateral claim data into amount and expiry, and checks expiry.
    /// @dev Expects `data` to be ABI encoded as `((uint256 amount, uint256 expiryTimestamp))` (tuple-wrapped for The Graph).
    ///      Also verifies that the decoded `expiry` timestamp is in the future.
    /// @param data The raw `bytes` data of the claim.
    /// @return decoded `true` if data was successfully decoded and is not expired, `false` otherwise.
    /// @return amount The decoded collateral amount (0 if decoding fails or claim expired).
    /// @return expiry The decoded expiry timestamp (0 if decoding fails or claim expired).
    function __decodeClaimData(bytes memory data) private view returns (bool decoded, uint256 amount, uint256 expiry) {
        // Attempt to decode the tuple-wrapped data.
        try this.__decodeCollateralTuple(data) returns (uint256 _amount, uint256 _expiry) {
            amount = _amount;
            expiry = _expiry;
        } catch {
            return (false, 0, 0); // Decoding failed.
        }

        // Check if the claim has already expired.
        if (expiry < block.timestamp || expiry == block.timestamp) {
            return (false, 0, 0); // Claim expired.
        }

        return (true, amount, expiry); // Successfully decoded and not expired.
    }

    /// @notice Helper function to decode tuple-wrapped collateral data
    /// @dev Claim data is wrapped in an extra tuple layer for The Graph compatibility.
    ///      The Graph's decode functions require tuple wrapping for reliable parsing of mixed static/dynamic types.
    /// @param data The raw bytes data to decode
    /// @return amount The collateral amount
    /// @return expiry The expiry timestamp
    function __decodeCollateralTuple(bytes memory data) public pure returns (uint256 amount, uint256 expiry) {
        // The data is tuple-wrapped for The Graph compatibility, so we skip the first 32 bytes (offset pointer)
        // and decode the remaining data as standard (uint256, uint256)
        require(data.length >= 32, "Invalid tuple-wrapped collateral data length");

        bytes memory actualData = new bytes(data.length - 32);
        for (uint256 i = 0; i < actualData.length; i++) {
            actualData[i] = data[i + 32];
        }

        (amount, expiry) = abi.decode(actualData, (uint256, uint256));
    }

    /// @notice Validates a claim with a specific issuer and decodes its data if valid.
    /// @dev This helper combines checking issuer validity and data decoding/expiry.
    /// @param issuer The `IClaimIssuer` to validate against.
    /// @param tokenIdentity The identity contract holding the claim.
    /// @param topic The claim's topic ID.
    /// @param signature The claim's signature component.
    /// @param data The claim's data component.
    /// @return success `true` if the claim is valid by the issuer, decodable, and not expired.
    /// @return amount The decoded collateral amount if `success` is true.
    /// @return expiry The decoded expiry timestamp if `success` is true.
    function __tryClaimWithIssuer(
        IClaimIssuer issuer,
        IIdentity tokenIdentity,
        uint256 topic,
        bytes memory signature,
        bytes memory data
    )
        private
        view
        returns (bool success, uint256 amount, uint256 expiry)
    {
        // Step 1: Check if the issuer considers the claim valid.
        bool isValidByIssuer = __checkClaimValidity(issuer, tokenIdentity, topic, signature, data);

        if (!isValidByIssuer) {
            return (false, 0, 0); // Issuer does not validate this claim.
        }

        // Step 2: Decode the claim data and check its expiry.
        (bool decodedSuccessfully, uint256 decodedAmount, uint256 decodedExpiry) = __decodeClaimData(data);

        if (!decodedSuccessfully) {
            return (false, 0, 0); // Data decoding failed or claim expired.
        }

        return (true, decodedAmount, decodedExpiry); // Claim is valid, decoded, and not expired.
    }

    /// @notice Checks a single claim ID against a list of trusted issuers to find if it's a valid collateral claim.
    /// @dev Retrieves the claim details from the `tokenID` (the token's own identity).
    ///      If the claim's topic matches `collateralProofTopic`, it iterates through `trustedIssuers`.
    ///      If the claim's actual issuer matches one of the `trustedIssuers`, it calls `__tryClaimWithIssuer`.
    ///      If that returns success, this function returns the details of the valid claim.
    ///      Uses a try-catch for `tokenID.getClaim` as the claim ID might not exist or be malformed.
    /// @param tokenID The `IIdentity` contract (token's own identity) to query for the claim.
    /// @param claimId The specific `bytes32` ID of the claim to check.
    /// @param trustedIssuers An array of `IClaimIssuer` contracts that are trusted for the collateral topic.
    /// @return validClaim `true` if this `claimId` corresponds to a valid collateral claim from a trusted issuer.
    /// @return amount The decoded collateral amount if `validClaim` is true.
    /// @return issuer The address of the trusted issuer if `validClaim` is true.
    /// @return expiry The expiry timestamp of the claim if `validClaim` is true.
    function __checkSingleClaim(
        IIdentity tokenID,
        bytes32 claimId,
        IClaimIssuer[] memory trustedIssuers
    )
        private
        view
        returns (bool validClaim, uint256 amount, address issuer, uint256 expiry)
    {
        // Attempt to retrieve the claim from the identity contract.
        try tokenID.getClaim(claimId) returns (
            uint256 topicFromClaim,
            uint256, // scheme is not used here
            address actualClaimIssuerAddress,
            bytes memory signatureFromClaim,
            bytes memory dataFromClaim,
            string memory // uri is not used here
        ) {
            // Optimization: Only proceed if the claim's topic matches our target collateral topic.
            if (topicFromClaim != collateralProofTopic) {
                return (false, 0, address(0), 0); // Not the collateral claim topic we are looking for.
            }

            // Iterate through the list of issuers trusted for the collateralProofTopic.
            uint256 trustedIssuersLength = trustedIssuers.length;
            for (uint256 i = 0; i < trustedIssuersLength;) {
                IClaimIssuer currentTrustedIssuer = trustedIssuers[i];
                address currentTrustedIssuerAddress = address(currentTrustedIssuer);

                // Check if the actual issuer of this claim is one of the trusted issuers.
                if (actualClaimIssuerAddress != currentTrustedIssuerAddress) {
                    unchecked {
                        ++i; // Move to the next trusted issuer.
                    }
                    continue; // Not issued by this trusted issuer, try the next.
                }

                // Found the claim's issuer in the trusted list. Now, validate the claim with this specific issuer.
                (bool success, uint256 claimAmount, uint256 claimExpiry) = __tryClaimWithIssuer(
                    currentTrustedIssuer, tokenID, topicFromClaim, signatureFromClaim, dataFromClaim
                );

                if (success) {
                    // Claim is valid, decoded, and not expired. This is our collateral proof.
                    return (true, claimAmount, actualClaimIssuerAddress, claimExpiry);
                }

                // If we found the correct issuer but the claim was not valid (e.g., revoked, malformed data, expired
                // with this issuer),
                // there's no need to check other trusted issuers for *this specific claimId* because a claim has only
                // one issuer.
                break; // Exit loop for trustedIssuers, move to next claimId if any.
            }
        } catch {
            // `getClaim(claimId)` reverted. This means the claimId doesn't exist or there was an issue fetching it.
            // Silently ignore and treat as not a valid collateral claim. Proceed to the next claimId if any.
        }

        // If loop completes or getClaim failed, this claimId did not yield a valid collateral proof from a trusted
        // issuer.
        return (false, 0, address(0), 0);
    }

    // -- Internal Hook Helper Function --

    /// @notice Internal logic hook executed before minting to enforce collateral requirements.
    /// @dev This function is intended to be called from the `_beforeMint` hook of an inheriting contract.
    ///      1. It calls `findValidCollateralClaim()` to get the validated collateral amount from the
    ///         token contract's own OnchainID identity.
    ///      2. It calculates the `requiredTotalSupply` (current total supply + amount being minted).
    ///         It assumes `this.totalSupply()` is available from the inheriting ERC20 contract.
    ///      3. It reverts with `InsufficientCollateral` if the `collateralAmountFromClaim` is less than
    ///         the `requiredTotalSupply`. If no valid claim is found, `collateralAmountFromClaim` will be 0,
    ///         thus minting would only be allowed if `requiredTotalSupply` is also 0 (which is unlikely for a mint
    /// operation).
    ///      The `virtual` keyword allows this logic to be potentially extended or modified by deeply derived contracts,
    ///      though it's typically a final check.
    /// @param amountToMint The amount of new tokens intended to be minted.
    function __collateral_beforeMintLogic(uint256 amountToMint) internal view virtual {
        // Find the currently valid collateral amount from the token's own identity claim.
        (uint256 collateralAmountFromClaim,,) = findValidCollateralClaim();

        uint256 currentTotalSupply = __collateral_totalSupply();
        // Calculate what the total supply would be *after* the proposed mint operation.
        // Solidity ^0.8.x provides automatic overflow/underflow checks for arithmetic.
        uint256 requiredTotalSupply = currentTotalSupply + amountToMint;

        // Ensure the collateral amount from the claim is sufficient to cover the new projected total supply.
        if (collateralAmountFromClaim < requiredTotalSupply) {
            revert InsufficientCollateral(requiredTotalSupply, collateralAmountFromClaim);
        }
    }
}
