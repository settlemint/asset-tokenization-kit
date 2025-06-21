// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { ISMART } from "../interface/ISMART.sol";

/// @title Identity Verification Module
/// @author SettleMint Tokenization Services
/// @notice This module is used to verify the identity of an investor.
/// @dev This module is used to verify the identity of an investor.
contract SMARTIdentityVerificationComplianceModule is AbstractComplianceModule {
    bytes32 public constant override typeId = keccak256("SMARTIdentityVerificationComplianceModule");

    /// @notice Reverted when a token operation (like transfer or mint) is attempted, but the recipient
    ///         (or potentially sender, depending on the operation) does not meet the required identity verification
    /// status.
    /// @dev Verification status is typically checked against the `ISMARTIdentityRegistry` and the token's
    /// `requiredClaimTopics`.
    ///      For example, a recipient might need to have specific claims (like KYC) issued by trusted parties.
    error RecipientNotVerified();

    // --- Constructor ---
    /// @notice Constructor for the `IdentityVerificationModule`.
    /// @dev When a contract inheriting from `IdentityVerificationModule` is deployed, this constructor is called.
    constructor(address trustedForwarder_) AbstractComplianceModule(trustedForwarder_) { }

    // --- Functions ---

    function canTransfer(
        address token,
        address, /* _from - unused */
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        view
        virtual
        override
    {
        uint256[] memory requiredClaimTopics = _decodeParams(_params);
        if (!ISMARTIdentityRegistry(ISMART(token).identityRegistry()).isVerified(_to, requiredClaimTopics)) {
            revert RecipientNotVerified();
        }
    }

    // --- Parameter Validation --- (Standard for Country Modules)

    function validateParameters(bytes calldata _params) public view virtual override {
        // Attempt to decode parameters as an array of uint16 (country codes).
        // If _params is not correctly ABI-encoded as `uint16[]`, this abi.decode call will revert.
        abi.decode(_params, (uint256[]));
        // If decoding is successful, the format is considered valid by this abstract module.
    }

    function _decodeParams(bytes calldata _params) internal pure returns (uint256[] memory requiredClaimTopics) {
        return abi.decode(_params, (uint256[]));
    }

    /// @inheritdoc AbstractComplianceModule
    function name() external pure override returns (string memory) {
        return "Identity Verification Module";
    }
}
