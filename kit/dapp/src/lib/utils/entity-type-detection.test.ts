import { describe, expect, it } from "vitest";

import { detectEntityType } from "./entity-type-detection";

describe("detectEntityType", () => {
  it("returns contract when interfaces missing", () => {
    expect(detectEntityType()).toBe("contract");
    expect(detectEntityType([])).toBe("contract");
  });

  it("classifies custodians via interface id or name", () => {
    expect(detectEntityType(["0x25e5ad79"])).toBe("custodian");
    expect(detectEntityType(["ISMARTCustodian"])).toBe("custodian");
  });

  it("classifies vault implementations", () => {
    expect(detectEntityType(["IATKVault"])).toBe("vault");
    expect(detectEntityType(["IATKVaultFactory"])).toBe("vault");
  });

  it("classifies tokens and related instruments", () => {
    expect(detectEntityType(["IATKToken"])).toBe("token");
    expect(detectEntityType(["IATKBond"])).toBe("token");
    expect(detectEntityType(["IATKFund"])).toBe("token");
  });

  it("falls back to contract for unknown interfaces", () => {
    expect(detectEntityType(["0xdeadbeef"])).toBe("contract");
    expect(detectEntityType(["UnknownInterface"])).toBe("contract");
  });
});
