import type { CurrentUser } from "@/orpc/routes/user/routes/user.me.schema";
import { vi } from "vitest";

/**
 * Creates a mock user with default onboarding state
 */
export function createMockUser(
  overrides: Partial<CurrentUser> = {}
): CurrentUser {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    walletAddress: null,
    language: "en",
    pincode: false,
    twoFactorEnabled: false,
    kycStatus: "none",
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
    ...overrides,
  };
}

/**
 * Creates a mock admin user
 */
export function createMockAdminUser(
  overrides: Partial<CurrentUser> = {}
): CurrentUser {
  return createMockUser({
    role: "admin",
    ...overrides,
  });
}

/**
 * Creates a mock ORPC client with common endpoints
 */
export function createMockOrpcClient() {
  const mockUser = createMockUser();

  return {
    user: {
      me: {
        queryOptions: vi.fn(() => ({
          queryKey: ["user", "me"],
          queryFn: () => Promise.resolve(mockUser),
        })),
        $query: vi.fn(() => Promise.resolve(mockUser)),
      },
      updateOnboarding: {
        $mutate: vi.fn(() => Promise.resolve({ success: true })),
        mutationOptions: vi.fn(() => ({
          mutationKey: ["user", "updateOnboarding"],
          mutationFn: () => Promise.resolve({ success: true }),
        })),
      },
    },
    wallet: {
      create: {
        $mutate: vi.fn(() =>
          Promise.resolve({
            address: "0x1234567890123456789012345678901234567890",
            mnemonic: "test mnemonic phrase here",
          })
        ),
      },
    },
    auth: {
      pincode: {
        enable: {
          $mutate: vi.fn(() => Promise.resolve({ success: true })),
        },
      },
      twoFactor: {
        enable: {
          $mutate: vi.fn(() =>
            Promise.resolve({
              qrCode: "data:image/png;base64,test",
              secret: "test-secret",
            })
          ),
        },
      },
      recoveryCodes: {
        generate: {
          $mutate: vi.fn(() =>
            Promise.resolve({
              codes: ["code1", "code2", "code3", "code4", "code5", "code6"],
            })
          ),
        },
      },
    },
    system: {
      deploy: {
        $mutate: vi.fn(() => Promise.resolve({ success: true })),
      },
      settings: {
        update: {
          $mutate: vi.fn(() => Promise.resolve({ success: true })),
        },
      },
    },
  };
}

/**
 * Updates the mock user in the ORPC client
 */
export function updateMockUser(
  orpcClient: ReturnType<typeof createMockOrpcClient>,
  updates: Partial<CurrentUser>
) {
  const currentUser = orpcClient.user.me.$query();
  const updatedUser = { ...currentUser, ...updates };

  orpcClient.user.me.$query.mockResolvedValue(updatedUser);
  orpcClient.user.me.queryOptions.mockReturnValue({
    queryKey: ["user", "me"],
    queryFn: () => Promise.resolve(updatedUser),
  });
}
