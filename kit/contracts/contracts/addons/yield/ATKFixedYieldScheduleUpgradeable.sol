// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { SMARTFixedYieldScheduleUpgradeable } from
    "../../smart/extensions/yield/schedules/fixed/SMARTFixedYieldScheduleUpgradeable.sol";

import { IContractWithIdentity } from "../../system/identity-factory/IContractWithIdentity.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ATKFixedYieldScheduleUpgradeable is SMARTFixedYieldScheduleUpgradeable, IContractWithIdentity {
    /// @notice The address of the ONCHAINID associated with this contract
    address private _onchainID;

    /// @notice Error thrown when trying to set an invalid onchain ID
    error InvalidOnchainID();

    constructor(address forwarder) SMARTFixedYieldScheduleUpgradeable(forwarder) { }

    /// @notice Sets the onchain ID for this contract
    /// @dev Can only be called by an address with DEFAULT_ADMIN_ROLE
    /// @param onchainID_ The address of the onchain ID contract
    function setOnchainId(address onchainID_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (onchainID_ == address(0)) revert InvalidOnchainID();
        _onchainID = onchainID_;
    }

    /// @inheritdoc IContractWithIdentity
    function onchainID() external view override returns (address) {
        return _onchainID;
    }

    /// @inheritdoc IContractWithIdentity
    function canAddClaim(address actor) external view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, actor);
    }

    /// @inheritdoc IContractWithIdentity
    function canRemoveClaim(address actor) external view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, actor);
    }

    /// @notice Checks if this contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(SMARTFixedYieldScheduleUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}
