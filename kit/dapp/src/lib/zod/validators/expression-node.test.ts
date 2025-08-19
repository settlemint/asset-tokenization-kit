import { describe, expect, it } from "vitest";
import {
  convertInfixToPostfix,
  convertPostfixToInfix,
  createAndExpressionNode,
  createNotExpressionNode,
  createOrExpressionNode,
  createTopicExpressionNode,
  expression,
  expressionNode,
  expressionNodeWithGroups,
  expressionWithGroups,
  validateExpressionSyntax,
  validateExpressionWithGroups,
  type ExpressionWithGroups,
} from "./expression-node";
import { ExpressionTypeEnum } from "./expression-type";
import { ATKTopicEnum } from "./topics";

describe("expressionNode", () => {
  describe("valid inputs", () => {
    it("should accept valid TOPIC node", () => {
      const node = { nodeType: 0, value: 1n };
      expect(expressionNode.parse(node)).toEqual(node);
    });

    it("should accept valid AND node", () => {
      const node = { nodeType: 1, value: 0n };
      expect(expressionNode.parse(node)).toEqual(node);
    });

    it("should accept valid OR node", () => {
      const node = { nodeType: 2, value: 0n };
      expect(expressionNode.parse(node)).toEqual(node);
    });

    it("should accept valid NOT node", () => {
      const node = { nodeType: 3, value: 0n };
      expect(expressionNode.parse(node)).toEqual(node);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid nodeType", () => {
      expect(() => expressionNode.parse({ nodeType: 4, value: 0n })).toThrow();
      expect(() => expressionNode.parse({ nodeType: -1, value: 0n })).toThrow();
    });

    it("should reject invalid value type", () => {
      expect(() => expressionNode.parse({ nodeType: 0, value: "1" })).toThrow();
      expect(() => expressionNode.parse({ nodeType: 0, value: 1 })).toThrow();
    });

    it("should reject missing properties", () => {
      expect(() => expressionNode.parse({ nodeType: 0 })).toThrow();
      expect(() => expressionNode.parse({ value: 0n })).toThrow();
    });
  });
});

describe("expression", () => {
  it("should accept array of valid expression nodes", () => {
    const nodes = [
      { nodeType: 0, value: 1n },
      { nodeType: 0, value: 2n },
      { nodeType: 1, value: 0n },
    ];
    expect(expression.parse(nodes)).toEqual(nodes);
  });

  it("should reject array with invalid nodes", () => {
    const nodes = [
      { nodeType: 0, value: 1n },
      { nodeType: 4, value: 0n }, // Invalid nodeType
    ];
    expect(() => expression.parse(nodes)).toThrow();
  });

  it("should accept empty array", () => {
    expect(expression.parse([])).toEqual([]);
  });
});

describe("expressionNodeWithGroups", () => {
  it("should accept valid expression node", () => {
    const node = { nodeType: 0, value: 1n };
    expect(expressionNodeWithGroups.parse(node)).toEqual(node);
  });

  it("should accept opening parenthesis", () => {
    expect(expressionNodeWithGroups.parse("(")).toBe("(");
  });

  it("should accept closing parenthesis", () => {
    expect(expressionNodeWithGroups.parse(")")).toBe(")");
  });

  it("should reject other strings", () => {
    expect(() => expressionNodeWithGroups.parse("[")).toThrow();
    expect(() => expressionNodeWithGroups.parse("AND")).toThrow();
  });
});

describe("expressionWithGroups", () => {
  it("should accept mixed array of nodes and parentheses", () => {
    const nodes = [
      "(",
      { nodeType: 0, value: 1n },
      { nodeType: 0, value: 2n },
      { nodeType: 1, value: 0n },
      ")",
    ];
    expect(expressionWithGroups.parse(nodes)).toEqual(nodes);
  });

  it("should reject invalid elements", () => {
    const nodes = [
      "[", // Invalid grouping character
      { nodeType: 0, value: 1n },
    ];
    expect(() => expressionWithGroups.parse(nodes)).toThrow();
  });
});

describe("createTopicExpressionNode", () => {
  it("should create TOPIC node for kyc", () => {
    const node = createTopicExpressionNode(ATKTopicEnum.kyc);
    expect(node.nodeType).toBe(ExpressionTypeEnum.TOPIC);
    expect(typeof node.value).toBe("bigint");
    expect(node.value > 0n).toBe(true);
  });

  it("should create different values for different topics", () => {
    const kycNode = createTopicExpressionNode(ATKTopicEnum.kyc);
    const amlNode = createTopicExpressionNode(ATKTopicEnum.aml);
    expect(kycNode.value).not.toBe(amlNode.value);
  });
});

describe("createAndExpressionNode", () => {
  it("should create AND node", () => {
    const node = createAndExpressionNode();
    expect(node).toEqual({
      nodeType: ExpressionTypeEnum.AND,
      value: 0n,
    });
  });
});

describe("createOrExpressionNode", () => {
  it("should create OR node", () => {
    const node = createOrExpressionNode();
    expect(node).toEqual({
      nodeType: ExpressionTypeEnum.OR,
      value: 0n,
    });
  });
});

describe("createNotExpressionNode", () => {
  it("should create NOT node", () => {
    const node = createNotExpressionNode();
    expect(node).toEqual({
      nodeType: ExpressionTypeEnum.NOT,
      value: 0n,
    });
  });
});

describe("validateExpressionSyntax", () => {
  it("should validate simple topic expression", () => {
    const nodes = [{ nodeType: ExpressionTypeEnum.TOPIC, value: 1n }];
    expect(validateExpressionSyntax(nodes)).toBe(true);
  });

  it("should validate AND expression", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(true);
  });

  it("should validate OR expression", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(true);
  });

  it("should validate NOT expression", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.NOT, value: 0n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(true);
  });

  it("should validate complex expression", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 3n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(true);
  });

  it("should reject empty expression", () => {
    expect(validateExpressionSyntax([])).toBe(false);
  });

  it("should reject incomplete binary operator", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(false);
  });

  it("should reject incomplete unary operator", () => {
    const nodes = [{ nodeType: ExpressionTypeEnum.NOT, value: 0n }];
    expect(validateExpressionSyntax(nodes)).toBe(false);
  });

  it("should reject too many operands", () => {
    const nodes = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
    ];
    expect(validateExpressionSyntax(nodes)).toBe(false);
  });
});

describe("validateExpressionWithGroups", () => {
  it("should validate simple grouped expression", () => {
    const nodes: ExpressionWithGroups = [
      "(",
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
      ")",
    ];
    expect(validateExpressionWithGroups(nodes)).toBe(true);
  });

  it("should reject unmatched opening parenthesis", () => {
    const nodes: ExpressionWithGroups = [
      "(",
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    expect(validateExpressionWithGroups(nodes)).toBe(false);
  });

  it("should reject unmatched closing parenthesis", () => {
    const nodes: ExpressionWithGroups = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      ")",
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    expect(validateExpressionWithGroups(nodes)).toBe(false);
  });

  it("should reject empty expression", () => {
    expect(validateExpressionWithGroups([])).toBe(false);
  });
});

describe("convertInfixToPostfix", () => {
  it("should convert simple AND expression", () => {
    const infix: ExpressionWithGroups = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    const result = convertInfixToPostfix(infix);
    expect(result).toEqual([
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ]);
  });

  it("should handle precedence correctly", () => {
    const infix: ExpressionWithGroups = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 3n },
    ];
    const result = convertInfixToPostfix(infix);
    expect(result).toEqual([
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 3n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
    ]);
  });

  it("should handle parentheses", () => {
    const infix: ExpressionWithGroups = [
      "(",
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      ")",
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 3n },
    ];
    const result = convertInfixToPostfix(infix);
    expect(result).toEqual([
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.OR, value: 0n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 3n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ]);
  });

  it("should return null for unmatched parentheses", () => {
    const infix: ExpressionWithGroups = [
      "(",
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    expect(convertInfixToPostfix(infix)).toBe(null);
  });
});

describe("convertPostfixToInfix", () => {
  it("should convert simple topic", () => {
    const postfix = [{ nodeType: ExpressionTypeEnum.TOPIC, value: 1n }];
    const result = convertPostfixToInfix(postfix);
    expect(result).toEqual([{ nodeType: ExpressionTypeEnum.TOPIC, value: 1n }]);
  });

  it("should convert AND expression", () => {
    const postfix = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ];
    const result = convertPostfixToInfix(postfix);
    expect(result).toEqual([
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.TOPIC, value: 2n },
      { nodeType: ExpressionTypeEnum.AND, value: 0n },
    ]);
  });

  it("should convert NOT expression", () => {
    const postfix = [
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.NOT, value: 0n },
    ];
    const result = convertPostfixToInfix(postfix);
    expect(result).toEqual([
      { nodeType: ExpressionTypeEnum.TOPIC, value: 1n },
      { nodeType: ExpressionTypeEnum.NOT, value: 0n },
    ]);
  });

  it("should return empty array for invalid expression", () => {
    const postfix = [{ nodeType: ExpressionTypeEnum.AND, value: 0n }];
    expect(convertPostfixToInfix(postfix)).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    expect(convertPostfixToInfix([])).toEqual([]);
  });
});
