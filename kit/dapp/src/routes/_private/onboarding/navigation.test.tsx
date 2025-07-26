import {
  createMockOrpcClient,
  createMockUser,
  createMockAdminUser,
} from "@/test/mocks/orpc-mocks";
import { createTestRouter, navigateTo } from "@/test/utils/router-test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TestRouterProvider } from "@/test/utils/router-test-utils";

// Mock the ORPC client
const mockOrpc = createMockOrpcClient();
vi.mock("@/orpc/orpc-client", () => ({
  orpc: mockOrpc,
}));

describe("Onboarding Navigation Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Step-by-Step Navigation", () => {
    it("should navigate through all steps for regular user", async () => {
      const user = userEvent.setup();
      let currentUser = createMockUser();

      mockOrpc.user.me.queryOptions.mockImplementation(() => ({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(currentUser),
      }));

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], currentUser);

      render(<TestRouterProvider router={router} queryClient={queryClient} />);

      await router.load();

      // Step 1: Wallet creation
      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/onboarding/wallet");
      });

      // Complete wallet step
      currentUser = {
        ...currentUser,
        walletAddress: "0x1234567890123456789012345678901234567890",
        onboardingState: {
          ...currentUser.onboardingState,
          wallet: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentUser);
      await navigateTo(router, "/onboarding/wallet-security");

      // Step 2: Wallet Security
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-security"
        );
      });

      // Complete wallet security step
      currentUser = {
        ...currentUser,
        pincode: true,
        onboardingState: {
          ...currentUser.onboardingState,
          walletSecurity: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentUser);
      await navigateTo(router, "/onboarding/wallet-recovery-codes");

      // Step 3: Recovery Codes
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-recovery-codes"
        );
      });

      // Complete recovery codes step
      currentUser = {
        ...currentUser,
        onboardingState: {
          ...currentUser.onboardingState,
          walletRecoveryCodes: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentUser);

      // Should skip system steps for non-admin and go to identity setup
      await navigateTo(router, "/onboarding/identity-setup");

      // Step 4: Identity Setup
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/identity-setup"
        );
      });

      // Complete identity setup
      currentUser = {
        ...currentUser,
        onboardingState: {
          ...currentUser.onboardingState,
          identitySetup: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentUser);
      await navigateTo(router, "/onboarding/identity");

      // Step 5: Identity
      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/onboarding/identity");
      });

      // Complete final step
      currentUser = {
        ...currentUser,
        onboardingState: {
          ...currentUser.onboardingState,
          identity: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentUser);

      // Navigate to completion
      await navigateTo(router, "/onboarding?complete=true");

      await waitFor(() => {
        expect(router.state.location.search).toMatchObject({ complete: true });
      });
    });

    it("should include system steps for admin users", async () => {
      let currentAdmin = createMockAdminUser({
        onboardingState: {
          wallet: true,
          walletSecurity: true,
          walletRecoveryCodes: true,
          system: false,
          systemSettings: false,
          systemAssets: false,
          systemAddons: false,
          identitySetup: false,
          identity: false,
        },
      });

      mockOrpc.user.me.queryOptions.mockImplementation(() => ({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(currentAdmin),
      }));

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], currentAdmin);

      render(<TestRouterProvider router={router} queryClient={queryClient} />);

      await router.load();

      // Should start at system-deploy for admin
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/system-deploy"
        );
      });

      // Complete system deploy
      currentAdmin = {
        ...currentAdmin,
        onboardingState: {
          ...currentAdmin.onboardingState,
          system: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentAdmin);
      await navigateTo(router, "/onboarding/system-settings");

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/system-settings"
        );
      });

      // Complete system settings
      currentAdmin = {
        ...currentAdmin,
        onboardingState: {
          ...currentAdmin.onboardingState,
          systemSettings: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentAdmin);
      await navigateTo(router, "/onboarding/system-assets");

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/system-assets"
        );
      });

      // Complete system assets
      currentAdmin = {
        ...currentAdmin,
        onboardingState: {
          ...currentAdmin.onboardingState,
          systemAssets: true,
        },
      };
      queryClient.setQueryData(["user", "me"], currentAdmin);
      await navigateTo(router, "/onboarding/system-addons");

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/system-addons"
        );
      });
    });
  });

  describe("Direct Navigation Restrictions", () => {
    it("should prevent skipping to future steps", async () => {
      const mockUser = createMockUser({
        onboardingState: {
          wallet: true,
          walletSecurity: false,
          walletRecoveryCodes: false,
          system: false,
          systemSettings: false,
          systemAssets: false,
          systemAddons: false,
          identitySetup: false,
          identity: false,
        },
      });

      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(mockUser),
      });

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding/identity",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);
      await router.load();

      // Should redirect back to current step (wallet-security)
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-security"
        );
      });
    });

    it("should allow revisiting completed steps", async () => {
      const mockUser = createMockUser({
        walletAddress: "0x1234567890123456789012345678901234567890",
        pincode: true,
        onboardingState: {
          wallet: true,
          walletSecurity: true,
          walletRecoveryCodes: true,
          system: false,
          systemSettings: false,
          systemAssets: false,
          systemAddons: false,
          identitySetup: false,
          identity: false,
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
      await router.load();

      // Should allow viewing completed wallet step
      expect(router.state.location.pathname).toBe("/onboarding/wallet");
    });
  });

  describe("Progress Indicators", () => {
    it("should correctly identify current step", async () => {
      const mockUser = createMockUser({
        onboardingState: {
          wallet: true,
          walletSecurity: true,
          walletRecoveryCodes: false,
          system: false,
          systemSettings: false,
          systemAssets: false,
          systemAddons: false,
          identitySetup: false,
          identity: false,
        },
      });

      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(mockUser),
      });

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);

      render(<TestRouterProvider router={router} queryClient={queryClient} />);

      await router.load();

      // Verify current step is wallet-recovery-codes
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-recovery-codes"
        );
      });
    });
  });
});
