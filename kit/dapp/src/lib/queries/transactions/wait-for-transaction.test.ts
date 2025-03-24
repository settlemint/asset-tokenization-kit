import { describe, expect, mock, test } from "bun:test";
import { waitForSingleTransaction } from "./wait-for-transaction";

mock.module("@/lib/settlemint/portal", () => ({
  portalClient: {
    request: mock(() => ({
      getTransaction: {
        receipt: mockReceipt,
      },
    })),
  },
  portalGraphql: mock(() => ({})),
}));

const mockReceipt = {
  revertReasonDecoded: null,
  gasUsed: "2889121",
  blobGasPrice: null,
  blobGasUsed: null,
  blockHash:
    "0x8a06278080514abcd8344eacdad2b0898d7cf9e9c51770c41b4925dfaecafdab",
  blockNumber: "4518",
  contractAddress: null,
  cumulativeGasUsed: "2889121",
  effectiveGasPrice: "0",
  from: "0xa0f4aedd6687427ca9e5a42c3b639fc99f34c209",
  logs: [
    {
      data: "0x",
      topics: [
        "0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x000000000000000000000000a0f4aedd6687427ca9e5a42c3b639fc99f34c209",
        "0x0000000000000000000000005e771e1417100000000000000000000000000005",
      ],
      address: "0xedf1a40c8b14bd315e851c36e9602839ebc56e56",
      removed: false,
      logIndex: 0,
      blockHash:
        "0x8a06278080514abcd8344eacdad2b0898d7cf9e9c51770c41b4925dfaecafdab",
      blockNumber: "4518",
      transactionHash:
        "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6",
      transactionIndex: 0,
    },
    {
      data: "0x",
      topics: [
        "0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d",
        "0x47b7a6ef32f924153c4c0c2f871f8856bd114b4903c167827ef0f0694c583e27",
        "0x000000000000000000000000a0f4aedd6687427ca9e5a42c3b639fc99f34c209",
        "0x0000000000000000000000005e771e1417100000000000000000000000000005",
      ],
      address: "0xedf1a40c8b14bd315e851c36e9602839ebc56e56",
      removed: false,
      logIndex: 1,
      blockHash:
        "0x8a06278080514abcd8344eacdad2b0898d7cf9e9c51770c41b4925dfaecafdab",
      blockNumber: "4518",
      transactionHash:
        "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6",
      transactionIndex: 0,
    },
    {
      data: "0x",
      topics: [
        "0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d",
        "0x4f218fa1cf3180113024eb1bbca508696a5a0f0ecafaeea4da87c53e5d465892",
        "0x000000000000000000000000a0f4aedd6687427ca9e5a42c3b639fc99f34c209",
        "0x0000000000000000000000005e771e1417100000000000000000000000000005",
      ],
      address: "0xedf1a40c8b14bd315e851c36e9602839ebc56e56",
      removed: false,
      logIndex: 2,
      blockHash:
        "0x8a06278080514abcd8344eacdad2b0898d7cf9e9c51770c41b4925dfaecafdab",
      blockNumber: "4518",
      transactionHash:
        "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6",
      transactionIndex: 0,
    },
    {
      data: "0x",
      topics: [
        "0x9de2be681a220396ec1518a4ecd6c853a760e34fb9174e9213d7aa5a8b12f379",
        "0x000000000000000000000000edf1a40c8b14bd315e851c36e9602839ebc56e56",
        "0x000000000000000000000000a0f4aedd6687427ca9e5a42c3b639fc99f34c209",
      ],
      address: "0x5e771e1417100000000000000000000000000005",
      removed: false,
      logIndex: 3,
      blockHash:
        "0x8a06278080514abcd8344eacdad2b0898d7cf9e9c51770c41b4925dfaecafdab",
      blockNumber: "4518",
      transactionHash:
        "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6",
      transactionIndex: 0,
    },
  ],
  logsBloom:
    "0x00000004000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000020000000000080000000000000000000000022000000000000010000000000000080004002000000000008001000000000080020000000000000000000800000000000000001000100400100001004000000000000000000000000000000000000000000000000000000000000200000000000008000000000000000000000000000000000000001000000000000000000000000000002000000000220000000000000000000100000000000020000000000000000000000000000000800000000000000000000000000000000000",
  revertReason: null,
  root: null,
  status: "Success",
  to: "0x5e771e1417100000000000000000000000000005",
  transactionHash:
    "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6",
  transactionIndex: 0,
  type: "eip1559",
};

describe("waitForTransactions", () => {
  test("successfully parses transaction receipt", async () => {
    // Call waitForSingleTransaction with a single transaction hash
    const result = await waitForSingleTransaction(
      "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6"
    );

    // Verify the parsed receipt data
    expect(result.status).toBe("Success");
    expect(result.blockNumber).toBe("4518");
    expect(result.from).toBe("0xa0f4aedd6687427ca9e5a42c3b639fc99f34c209");
    expect(result.to).toBe("0x5e771e1417100000000000000000000000000005");
    expect(result.transactionHash).toBe(
      "0xbc1575575c842331ab270d299ee3e83e7300f02534cf7e43fbf17232a19689a6"
    );
    expect(result.logs).toHaveLength(4);
  });
});
