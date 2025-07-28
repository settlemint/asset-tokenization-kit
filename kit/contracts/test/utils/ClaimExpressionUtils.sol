// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ExpressionNode, ExpressionType } from "../../contracts/smart/interface/structs/ExpressionNode.sol";

library ClaimExpressionUtils {
    /**
     * @notice Converts an array of claim topic IDs to an array of ExpressionNode structs with AND relationships
     * @dev Creates a postfix expression where all topics are combined with left-associative AND operators
     *      For n topics, creates proper postfix: [TOPIC1, TOPIC2, AND, TOPIC3, AND, ..., TOPICn, AND]
     *      Examples:
     *      - 1 topic: [TOPIC1]
     *      - 2 topics: [TOPIC1, TOPIC2, AND] → "TOPIC1 AND TOPIC2"
     *      - 3 topics: [TOPIC1, TOPIC2, AND, TOPIC3, AND] → "(TOPIC1 AND TOPIC2) AND TOPIC3"
     * @param topics Array of topic IDs to convert
     * @return Array of ExpressionNode structs representing postfix expression
     */
    function topicsToExpressionNodes(uint256[] memory topics) internal pure returns (ExpressionNode[] memory) {
        if (topics.length == 0) {
            return new ExpressionNode[](0);
        }

        if (topics.length == 1) {
            // Single topic, no AND needed
            ExpressionNode[] memory singleTopicExpression = new ExpressionNode[](1);
            singleTopicExpression[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topics[0] });
            return singleTopicExpression;
        }

        // For multiple topics: n topics + (n-1) AND operators = 2n-1 total nodes
        ExpressionNode[] memory nodes = new ExpressionNode[](topics.length * 2 - 1);
        uint256 nodeIndex = 0;

        // Add first two topics
        nodes[nodeIndex++] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topics[0] });
        nodes[nodeIndex++] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topics[1] });

        // Add first AND
        nodes[nodeIndex++] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });

        // For remaining topics: add each topic followed by AND
        for (uint256 i = 2; i < topics.length; i++) {
            nodes[nodeIndex++] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topics[i] });
            nodes[nodeIndex++] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });
        }

        return nodes;
    }
}
