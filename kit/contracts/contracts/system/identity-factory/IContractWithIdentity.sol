// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IContractWithIdentity
/// @author SettleMint
/// @notice Interface for contracts that have an associated ONCHAINID and can manage claims
/// @dev This interface enables any contract (Token, Vault, etc.) to expose its ONCHAINID
///      and standardizes how permission checks for claim management are performed.
///      Supports detection via ERC-165. Replaces TokenIdentity with a generalized solution.
/// @custom:security-contact support@settlemint.com
interface IContractWithIdentity is IERC165 {
    /// @notice Returns the ONCHAINID associated with this contract
    /// @return The address of the ONCHAINID (IIdentity contract)
    function onchainID() external view returns (address);

    /// @notice Permission check: can `actor` add a claim?
    /// @param actor The address requesting to add a claim
    /// @return True if the actor can add claims, false otherwise
    function canAddClaim(address actor) external view returns (bool);

    /// @notice Permission check: can `actor` remove a claim?
    /// @param actor The address requesting to remove a claim
    /// @return True if the actor can remove claims, false otherwise
    function canRemoveClaim(address actor) external view returns (bool);
}
