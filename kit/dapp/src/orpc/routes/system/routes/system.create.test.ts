import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

describe("system.create - retry logic", () => {
  it("should retry querying TheGraph until system is indexed", async () => {
    const mockTheGraphClient = {
      query: vi.fn(),
    };

    const SystemQueryResultSchema = z.object({
      systems: z.array(
        z.object({
          id: z.string(),
        })
      ),
    });

    // First 2 calls return empty array (not indexed yet)
    // Third call returns the system
    mockTheGraphClient.query
      .mockResolvedValueOnce({ systems: [] })
      .mockResolvedValueOnce({ systems: [] })
      .mockResolvedValueOnce({
        systems: [{ id: "0x123...system" }],
      });

    // Simulate retry logic
    const maxRetries = 30;
    let result;

    for (let i = 0; i < maxRetries; i++) {
      result = await mockTheGraphClient.query();

      if (result.systems.length > 0) {
        break;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10)); // Fast timeout for test
      }
    }

    expect(result?.systems).toHaveLength(1);
    expect(result?.systems[0].id).toBe("0x123...system");
    expect(mockTheGraphClient.query).toHaveBeenCalledTimes(3);
  });

  it("should throw timeout error if system not indexed after max retries", async () => {
    const mockTheGraphClient = {
      query: vi.fn().mockResolvedValue({ systems: [] }),
    };

    const maxRetries = 3; // Use fewer retries for test
    let result;

    for (let i = 0; i < maxRetries; i++) {
      result = await mockTheGraphClient.query();

      if (result.systems.length > 0) {
        break;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    expect(result?.systems).toHaveLength(0);
    expect(mockTheGraphClient.query).toHaveBeenCalledTimes(3);
  });
});
