// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { OwnableOnceNext2StepUpgradeable } from "../../utils/OwnableOnceNext2StepUpgradeable.sol";
import { CTRStorage } from "../storage/CTRStorage.sol";
import { IClaimTopicsRegistry } from "../interface/IClaimTopicsRegistry.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC173 } from "../../roles/IERC173.sol";
import {
    ClaimTopicAdded,
    ClaimTopicRemoved,
    IERC3643ClaimTopicsRegistry
} from "../../ERC-3643/IERC3643ClaimTopicsRegistry.sol";

/// Errors

/// @dev Thrown when maximum topic number is reached.
/// @param _max maximum numlber of topics.
error MaxTopicsReached(uint256 _max);

/// @dev Thrown whern claim topic already exists.
error ClaimTopicAlreadyExists();

contract ClaimTopicsRegistry is IClaimTopicsRegistry, OwnableOnceNext2StepUpgradeable, CTRStorage, IERC165 {
    function init() external initializer {
        __Ownable_init();
    }

    /**
     *  @dev See {IClaimTopicsRegistry-addClaimTopic}.
     */
    function addClaimTopic(uint256 _claimTopic) external override onlyOwner {
        uint256 length = _claimTopics.length;
        require(length < 15, MaxTopicsReached(15));
        for (uint256 i = 0; i < length; i++) {
            require(_claimTopics[i] != _claimTopic, ClaimTopicAlreadyExists());
        }
        _claimTopics.push(_claimTopic);
        emit ClaimTopicAdded(_claimTopic);
    }

    /**
     *  @dev See {IClaimTopicsRegistry-removeClaimTopic}.
     */
    function removeClaimTopic(uint256 _claimTopic) external override onlyOwner {
        uint256 length = _claimTopics.length;
        for (uint256 i = 0; i < length; i++) {
            if (_claimTopics[i] == _claimTopic) {
                _claimTopics[i] = _claimTopics[length - 1];
                _claimTopics.pop();
                emit ClaimTopicRemoved(_claimTopic);
                break;
            }
        }
    }

    /**
     *  @dev See {IClaimTopicsRegistry-getClaimTopics}.
     */
    function getClaimTopics() external view override returns (uint256[] memory) {
        return _claimTopics;
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IERC3643ClaimTopicsRegistry).interfaceId || interfaceId == type(IERC173).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }
}
