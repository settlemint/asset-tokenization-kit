import { createMockOrpcClient, createMockUser } from "@/test/mocks/orpc-mocks";
import { createTestRouter } from "@/test/utils/router-test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TestRouterProvider } from "@/test/utils/router-test-utils";

// Mock the ORPC client
const mockOrpc = createMockOrpcClient();
vi.mock("@/orpc/orpc-client", () => ({
  orpc: mockOrpc,
}));

describe("Wallet Creation Step", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render wallet creation form when wallet is not created", async () => {
    const mockUser = createMockUser({
      onboardingState: {
        ...createMockUser().onboardingState,
        wallet: false,
      },
    });

    mockOrpc.user.me.queryOptions.mockReturnValue({
      queryKey: ["user", "me"],
      queryFn: () => Promise.resolve(mockUser),
    });

    const { router, queryClient } = createTestRouter({
      initialLocation: "/onboarding/wallet",
      context: { orpc: mockOrpc },
    });

    queryClient.setQueryData(["user", "me"], mockUser);

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    await waitFor(() => {
      expect(screen.getByText(/create.*wallet/i)).toBeInTheDocument();
    });
  });

  it("should show wallet created state when wallet exists", async () => {
    const mockUser = createMockUser({
      walletAddress: "0x1234567890123456789012345678901234567890",
      onboardingState: {
        ...createMockUser().onboardingState,
        wallet: true,
      },
    });

    mockOrpc.user.me.queryOptions.mockReturnValue({
      queryKey: ["user", "me"],
      queryFn: () => Promise.resolve(mockUser),
    });

    const { router, queryClient } = createTestRouter({
      initialLocation: "/onboarding/wallet",
      context: { orpc: mockOrpc },
    });

    queryClient.setQueryData(["user", "me"], mockUser);

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    await waitFor(() => {
      expect(screen.getByText(/wallet.*created/i)).toBeInTheDocument();
    });
  });

  it("should handle wallet creation flow", async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({
      onboardingState: {
        ...createMockUser().onboardingState,
        wallet: false,
      },
    });

    mockOrpc.user.me.queryOptions.mockReturnValue({
      queryKey: ["user", "me"],
      queryFn: () => Promise.resolve(mockUser),
    });

    mockOrpc.wallet.create.$mutate.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
      mnemonic: "test mnemonic phrase for wallet recovery",
    });

    const { router, queryClient } = createTestRouter({
      initialLocation: "/onboarding/wallet",
      context: { orpc: mockOrpc },
    });

    queryClient.setQueryData(["user", "me"], mockUser);

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    // Find and click create wallet button
    const createButton = await screen.findByRole("button", {
      name: /create.*wallet/i,
    });

    await user.click(createButton);

    // Verify wallet creation was called
    await waitFor(() => {
      expect(mockOrpc.wallet.create.$mutate).toHaveBeenCalled();
    });
  });

  it("should update onboarding state after wallet creation", async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({
      onboardingState: {
        ...createMockUser().onboardingState,
        wallet: false,
      },
    });

    mockOrpc.user.me.queryOptions.mockReturnValue({
      queryKey: ["user", "me"],
      queryFn: () => Promise.resolve(mockUser),
    });

    mockOrpc.wallet.create.$mutate.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
      mnemonic: "test mnemonic phrase for wallet recovery",
    });

    mockOrpc.user.updateOnboarding.$mutate.mockResolvedValue({
      success: true,
    });

    const { router, queryClient } = createTestRouter({
      initialLocation: "/onboarding/wallet",
      context: { orpc: mockOrpc },
    });

    queryClient.setQueryData(["user", "me"], mockUser);

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    const createButton = await screen.findByRole("button", {
      name: /create.*wallet/i,
    });

    await user.click(createButton);

    // Verify onboarding update was called
    await waitFor(() => {
      expect(mockOrpc.user.updateOnboarding.$mutate).toHaveBeenCalledWith({
        wallet: true,
      });
    });
  });

  it("should handle wallet creation errors", async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser({
      onboardingState: {
        ...createMockUser().onboardingState,
        wallet: false,
      },
    });

    mockOrpc.user.me.queryOptions.mockReturnValue({
      queryKey: ["user", "me"],
      queryFn: () => Promise.resolve(mockUser),
    });

    mockOrpc.wallet.create.$mutate.mockRejectedValue(
      new Error("Failed to create wallet")
    );

    const { router, queryClient } = createTestRouter({
      initialLocation: "/onboarding/wallet",
      context: { orpc: mockOrpc },
    });

    queryClient.setQueryData(["user", "me"], mockUser);

    render(<TestRouterProvider router={router} queryClient={queryClient} />);

    await router.load();

    const createButton = await screen.findByRole("button", {
      name: /create.*wallet/i,
    });

    await user.click(createButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed.*create.*wallet/i)).toBeInTheDocument();
    });
  });
});
