import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangeRolesSheet } from "./change-roles-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockToken = {
  id: "0x0000000000000000000000000000000000000000",
  name: "Mock",
  symbol: "MOCK",
  decimals: 18,
  totalSupply: [0n, 18],
  type: "bond",
  createdAt: 0,
  extensions: [],
  implementsERC3643: true,
  implementsSMART: true,
  pausable: { paused: false },
  capped: null,
  createdBy: { id: "0xowner" },
  redeemable: null,
  bond: null,
  fund: null,
  collateral: null,
  accessControl: undefined,
  userPermissions: undefined,
} as unknown as Parameters<typeof ChangeRolesSheet>[0]["asset"];

describe.skip("ChangeRolesSheet", () => {
  it("hides roles until address is set", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ChangeRolesSheet open onOpenChange={() => {}} asset={mockToken} />
      </QueryClientProvider>
    );

    expect(screen.queryByText(/roles/i)).not.toBeInTheDocument();
  });

  it("shows roles with preset address and enables continue only after change", async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ChangeRolesSheet
          open
          onOpenChange={() => {}}
          asset={mockToken}
          presetAccount={
            "0x1111111111111111111111111111111111111111" as `0x${string}`
          }
        />
      </QueryClientProvider>
    );

    // Values step should render roles
    expect(screen.getByText(/roles/i)).toBeInTheDocument();

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Toggle a role button (e.g., Supply Management)
    const roleBtn = screen.getByRole("button", { name: /supply management/i });
    await userEvent.click(roleBtn);

    expect(continueBtn).not.toBeDisabled();
  });
});
