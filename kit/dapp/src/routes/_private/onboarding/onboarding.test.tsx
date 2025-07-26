import { OnboardingStep } from "@/components/onboarding/state-machine";
import {
  createMockAdminUser,
  createMockOrpcClient,
  createMockUser,
} from "@/test/mocks/orpc-mocks";
import { createTestRouter, navigateTo } from "@/test/utils/router-test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock the ORPC client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: createMockOrpcClient(),
}));

describe("Onboarding Wizard", () => {
  describe("Route Navigation", () => {
    it("should redirect to the first incomplete step", async () => {
      const mockOrpc = createMockOrpcClient();
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
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      // Pre-populate the query cache
      queryClient.setQueryData(["user", "me"], mockUser);

      await router.load();
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-security"
        );
      });
    });

    it("should show welcome page when no step parameter is provided", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockUser = createMockUser();

      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(mockUser),
      });

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);
      await router.load();

      expect(router.state.location.pathname).toBe("/onboarding");
    });

    it("should show system steps only for admin users", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockAdminUser = createMockAdminUser({
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
        queryFn: () => Promise.resolve(mockAdminUser),
      });

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockAdminUser);
      await router.load();

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/system-deploy"
        );
      });
    });

    it("should skip system steps for non-admin users", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockUser = createMockUser({
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
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);
      await router.load();

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/identity-setup"
        );
      });
    });
  });

  describe("Step Completion", () => {
    it("should navigate to the next step when current step is completed", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockUser = createMockUser();

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

      // Simulate wallet creation completion
      const updatedUser = {
        ...mockUser,
        onboardingState: {
          ...mockUser.onboardingState,
          wallet: true,
        },
      };

      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(updatedUser),
      });
      queryClient.setQueryData(["user", "me"], updatedUser);

      // Navigate to next step
      await navigateTo(router, "/onboarding/wallet-security");

      await waitFor(() => {
        expect(router.state.location.pathname).toBe(
          "/onboarding/wallet-security"
        );
      });
    });

    it("should show completion state when all steps are done", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockUser = createMockUser({
        onboardingState: {
          wallet: true,
          walletSecurity: true,
          walletRecoveryCodes: true,
          system: true,
          systemSettings: true,
          systemAssets: true,
          systemAddons: true,
          identitySetup: true,
          identity: true,
        },
      });

      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.resolve(mockUser),
      });

      const { router, queryClient } = createTestRouter({
        initialLocation: "/onboarding?complete=true",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);
      await router.load();

      expect(router.state.location.pathname).toBe("/onboarding");
      expect(router.state.location.search).toMatchObject({ complete: true });
    });
  });

  describe("Direct Step Access", () => {
    it("should redirect to current step when accessing future steps", async () => {
      const mockOrpc = createMockOrpcClient();
      const mockUser = createMockUser({
        onboardingState: {
          wallet: false,
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

      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/onboarding/wallet");
      });
    });

    it("should allow accessing completed steps", async () => {
      const mockOrpc = createMockOrpcClient();
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
        initialLocation: "/onboarding/wallet",
        context: { orpc: mockOrpc },
      });

      queryClient.setQueryData(["user", "me"], mockUser);
      await router.load();

      // Should stay on wallet page since it's already completed
      expect(router.state.location.pathname).toBe("/onboarding/wallet");
    });
  });

  describe("Error Handling", () => {
    it("should handle user fetch errors gracefully", async () => {
      const mockOrpc = createMockOrpcClient();
      mockOrpc.user.me.queryOptions.mockReturnValue({
        queryKey: ["user", "me"],
        queryFn: () => Promise.reject(new Error("Network error")),
      });

      const { router } = createTestRouter({
        initialLocation: "/onboarding",
        context: { orpc: mockOrpc },
      });

      await expect(router.load()).rejects.toThrow();
    });
  });
});
