import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import { OnboardingGuard } from "./onboarding-guard";
// ReactNode type not needed in this test file

// Mock dependencies
const mockNavigate = mock(() => {
  // Mock navigate function
});
const mockIsOnboarded = mock(() => false);

void mock.module("@tanstack/react-router", () => ({
  useNavigate: mock(() => mockNavigate),
}));

void mock.module("@kit/ui/hooks", () => ({
  useIsOnboarded: mock(() => ({
    data: mockIsOnboarded(),
    isLoading: false,
  })),
}));

void mock.module("@kit/ui/lib/hooks/use-user", () => ({
  useUser: mock(() => ({
    data: {
      onboardingType: "issuer",
    },
    isLoading: false,
  })),
}));

describe("OnboardingGuard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockIsOnboarded.mockReturnValue(false);
  });

  it("renders children when user is onboarded and require is 'onboarded'", () => {
    mockIsOnboarded.mockReturnValue(true);

    render(
      <OnboardingGuard require="onboarded">
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children when user is not onboarded and require is 'not-onboarded'", () => {
    mockIsOnboarded.mockReturnValue(false);

    render(
      <OnboardingGuard require="not-onboarded">
        <div>Onboarding Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByText("Onboarding Content")).toBeInTheDocument();
  });

  it("redirects to onboarding when not onboarded and require is 'onboarded'", async () => {
    mockIsOnboarded.mockReturnValue(false);

    render(
      <OnboardingGuard require="onboarded">
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/onboarding" });
    });
  });

  it("redirects to dashboard when onboarded and require is 'not-onboarded'", async () => {
    mockIsOnboarded.mockReturnValue(true);

    render(
      <OnboardingGuard require="not-onboarded">
        <div>Onboarding Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });

  it("shows loading state when data is loading", async () => {
    const { useIsOnboarded } = await import("@kit/ui/hooks");
    (useIsOnboarded as ReturnType<typeof mock>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(
      <OnboardingGuard require="onboarded">
        <div>Content</div>
      </OnboardingGuard>
    );

    expect(container.textContent).toBe("");
  });

  it("handles platform-onboarded requirement", async () => {
    const { useIsOnboarded } = await import("@kit/ui/hooks");
    (useIsOnboarded as ReturnType<typeof mock>).mockReturnValue({
      data: {
        issuers: false,
        investors: false,
        platform: true,
      },
      isLoading: false,
    });

    render(
      <OnboardingGuard require="platform-onboarded">
        <div>Platform Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByText("Platform Content")).toBeInTheDocument();
  });

  it("redirects when platform not onboarded for platform-onboarded requirement", async () => {
    const { useIsOnboarded } = await import("@kit/ui/hooks");
    (useIsOnboarded as ReturnType<typeof mock>).mockReturnValue({
      data: {
        issuers: true,
        investors: true,
        platform: false,
      },
      isLoading: false,
    });

    render(
      <OnboardingGuard require="platform-onboarded">
        <div>Platform Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/onboarding" });
    });
  });

  it("filters by allowed onboarding types", async () => {
    mockIsOnboarded.mockReturnValue(false);

    const { useUser } = await import("@kit/ui/lib/hooks/use-user");
    (useUser as ReturnType<typeof mock>).mockReturnValue({
      data: {
        onboardingType: "investor",
      },
      isLoading: false,
    });

    render(
      <OnboardingGuard require="not-onboarded" allowedTypes={["issuer"]}>
        <div>Issuer Only Content</div>
      </OnboardingGuard>
    );

    expect(screen.queryByText("Issuer Only Content")).not.toBeInTheDocument();
  });

  it("renders when user type is in allowed types", async () => {
    mockIsOnboarded.mockReturnValue(false);

    const { useUser } = await import("@kit/ui/lib/hooks/use-user");
    (useUser as ReturnType<typeof mock>).mockReturnValue({
      data: {
        onboardingType: "issuer",
      },
      isLoading: false,
    });

    render(
      <OnboardingGuard
        require="not-onboarded"
        allowedTypes={["issuer", "investor"]}
      >
        <div>Allowed Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByText("Allowed Content")).toBeInTheDocument();
  });

  it("handles multiple onboarding states correctly", async () => {
    const { useIsOnboarded } = await import("@kit/ui/hooks");
    (useIsOnboarded as ReturnType<typeof mock>).mockReturnValue({
      data: {
        issuers: true,
        investors: false,
        platform: true,
      },
      isLoading: false,
    });

    const { useUser } = await import("@kit/ui/lib/hooks/use-user");
    (useUser as ReturnType<typeof mock>).mockReturnValue({
      data: {
        onboardingType: "issuer",
      },
      isLoading: false,
    });

    render(
      <OnboardingGuard require="onboarded">
        <div>Issuer Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByText("Issuer Content")).toBeInTheDocument();
  });

  it("renders nothing when user data is loading", async () => {
    const { useUser } = await import("@kit/ui/lib/hooks/use-user");
    (useUser as ReturnType<typeof mock>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(
      <OnboardingGuard require="onboarded">
        <div>Content</div>
      </OnboardingGuard>
    );

    expect(container.textContent).toBe("");
  });

  it("handles undefined onboarding data gracefully", async () => {
    const { useIsOnboarded } = await import("@kit/ui/hooks");
    (useIsOnboarded as ReturnType<typeof mock>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { container } = render(
      <OnboardingGuard require="onboarded">
        <div>Content</div>
      </OnboardingGuard>
    );

    expect(container.textContent).toBe("");
  });
});
