import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionFormSheet } from "./action-form-sheet";

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
} as unknown as Parameters<typeof ActionFormSheet>[0]["asset"];

describe.skip("ActionFormSheet", () => {
  it("renders title and description", () => {
    render(
      <ActionFormSheet
        open
        onOpenChange={() => {}}
        asset={mockToken}
        title="Title"
        description="Description"
        submitLabel="Save"
        onSubmit={() => {}}
      >
        <div data-testid="content">content</div>
      </ActionFormSheet>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("disables continue when canContinue returns false", async () => {
    const onSubmit = vi.fn();
    render(
      <ActionFormSheet
        open
        onOpenChange={() => {}}
        asset={mockToken}
        title="Title"
        description="Description"
        submitLabel="Save"
        hasValuesStep
        canContinue={() => false}
        onSubmit={onSubmit}
      >
        <div />
      </ActionFormSheet>
    );

    const cont = screen.getByRole("button", { name: /continue/i });
    expect(cont).toBeDisabled();

    await userEvent.click(cont);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
