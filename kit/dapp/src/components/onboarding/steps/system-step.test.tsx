import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import { SystemStep } from "./system-step";

// Mock API and hooks
const mockMutate = mock(() => Promise.resolve());
const mockInvalidateSetting = mock(() => {
  // Mock invalidate settings function
});

void mock.module("@/hooks/use-settings", () => ({
  useSettings: mock(() => [null, mock(() => {
    // Mock set settings function
  }), mockInvalidateSetting]),
}));

void mock.module("@/hooks/use-streaming-mutation", () => ({
  useStreamingMutation: mock(() => ({
    mutate: mockMutate,
    isPending: false,
    isTracking: false,
  })),
}));

void mock.module("@/orpc", () => ({
  orpc: {
    system: {
      create: {
        mutationOptions: mock(() => ({})),
      },
    },
  },
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

// Mock UI components
void mock.module("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("SystemStep", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockInvalidateSetting.mockClear();
  });

  it("renders initial state correctly", () => {
    render(<SystemStep />);

    expect(screen.getByText("system.deploy-smart-system")).toBeInTheDocument();
    expect(
      screen.getByText("system.deploy-blockchain-infrastructure")
    ).toBeInTheDocument();
  });

  it("starts deployment automatically when action is registered", async () => {
    let registeredAction: (() => void) | null = null;

    render(
      <SystemStep
        onRegisterAction={(action) => {
          registeredAction = action;
        }}
      />
    );

    expect(registeredAction).not.toBeNull();

    // Execute the registered action
    if (registeredAction) {
      registeredAction();
    }

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("shows deployment progress", async () => {
    const { useStreamingMutation } = await import("@/hooks/use-streaming-mutation");
    (useStreamingMutation as ReturnType<typeof mock>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isTracking: true,
    });

    render(<SystemStep />);

    // Should show deploying message
    expect(screen.getByText("Deploying...")).toBeInTheDocument();
  });

  it("calls onSuccess after successful deployment", async () => {
    const mockOnSuccess = mock(() => {
      // Mock onSuccess callback
    });

    render(<SystemStep onSuccess={mockOnSuccess} />);

    // Simulate successful deployment by calling the onSuccess callback
    const { useStreamingMutation } = await import("@/hooks/use-streaming-mutation");
    const mockCall = (useStreamingMutation as ReturnType<typeof mock>).mock
      .calls[0];
    const options = mockCall[0];

    // Call the onSuccess callback
    await options.onSuccess();

    expect(mockInvalidateSetting).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("shows loading spinner during deployment", async () => {
    const { useStreamingMutation } = await import("@/hooks/use-streaming-mutation");
    (useStreamingMutation as ReturnType<typeof mock>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isTracking: false,
    });

    render(<SystemStep />);

    expect(screen.getByText("Deploying...")).toBeInTheDocument();
  });

  it("shows success state when deployment is complete", async () => {
    const { useSettings } = await import("@/hooks/use-settings");
    (useSettings as ReturnType<typeof mock>).mockReturnValue([
      "0x1234567890abcdef",
      mock(() => {
        // Mock set settings function
      }),
      mockInvalidateSetting,
    ]);

    render(<SystemStep />);

    expect(screen.getByText("system.system-deployed")).toBeInTheDocument();
    expect(
      screen.getByText("system.your-blockchain-infrastructure-ready")
    ).toBeInTheDocument();
    expect(
      screen.getByText("system.system-deployed-successfully")
    ).toBeInTheDocument();
    expect(screen.getByText("0x1234567890abcdef")).toBeInTheDocument();
  });

  it("shows info boxes when system not deployed", () => {
    render(<SystemStep />);

    expect(screen.getByText("system.what-is-smart-system")).toBeInTheDocument();
    expect(
      screen.getByText("system.smart-system-description")
    ).toBeInTheDocument();
    expect(screen.getByText("system.system-deployment")).toBeInTheDocument();
    expect(
      screen.getByText("system.deployment-time-notice")
    ).toBeInTheDocument();
  });

  it("does not trigger deployment when system already exists", async () => {
    const { useSettings } = await import("@/hooks/use-settings");
    (useSettings as ReturnType<typeof mock>).mockReturnValue([
      "0x1234567890abcdef",
      mock(() => {
        // Mock set settings function
      }),
      mockInvalidateSetting,
    ]);

    let registeredAction: (() => void) | null = null;

    render(
      <SystemStep
        onRegisterAction={(action) => {
          registeredAction = action;
        }}
      />
    );

    // Should not register action when system exists
    expect(registeredAction).toBeNull();
  });

  it("passes correct verification data to mutate", async () => {
    let registeredAction: (() => void) | null = null;

    render(
      <SystemStep
        onRegisterAction={(action) => {
          registeredAction = action;
        }}
      />
    );

    expect(registeredAction).not.toBeNull();
    if (registeredAction) {
      registeredAction();
    }

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        verification: {
          verificationCode: "111111",
          verificationType: "pincode",
        },
        messages: expect.any(Object),
      });
    });
  });
});
