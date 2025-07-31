// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ZeroAddressNotAllowed } from "../ATKSystemErrors.sol";
import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";


/// @title Internal Logic for ATK System Access Management
/// @author SettleMint
/// @notice This abstract contract encapsulates the core shared logic for managing access
///         control in ATK System components. It handles the storage of the access manager's address
///         and provides internal functions for role checks and initialization.
///         Using an internal logic contract helps to avoid code duplication between
///         the standard and upgradeable versions of an extension and promotes modularity.
/// @dev This contract is not meant to be deployed directly but rather inherited by
///      `ATKSystemAccessManaged` and `ATKSystemAccessManagedUpgradeable` contracts.
///      It implements access management by delegating `hasRole` checks to the
///      configured `_accessManager`.
interface IATKSystemAccessManaged {
    function accessManager() external view returns (address);
}