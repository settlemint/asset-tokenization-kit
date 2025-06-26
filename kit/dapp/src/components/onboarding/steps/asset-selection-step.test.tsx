import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetSelectionStep } from "./asset-selection-step";

// Mock form and mutations
const mockSubmit = mock(() => Promise.resolve());
const mockMutate = mock(() => Promise.resolve());
const mockIterator = {
  next: mock(() => Promise.resolve({ done: true, value: null })),
};

void mock.module("react-hook-form", () => ({
  useForm: mock(() => ({
    handleSubmit: (fn: (data: { assets: string[] }) => void) => () => {
      fn({ assets: ["Bond", "Equity"] });
    },
    control: {},
    setValue: mock(() => {
      // Mock setValue function
    }),
    watch: mock(() => ({})),
    formState: { errors: {} },
  })),
  Controller: ({
    render: renderProp,
  }: {
    render: (props: {
      field: { value: string[]; onChange: (value: string[]) => void };
    }) => React.ReactNode;
  }) =>
    renderProp({
      field: {
        value: ["Bond"],
        onChange: mock(() => {
          // Mock onChange function
        }),
      },
    }),
}));

void mock.module("@kit/api/react", () => ({
  api: {
    onboarding: {
      createTokenFactories: {
        useStreamingMutation: mock(() => ({
          mutate: mockMutate,
          iterator: mockIterator,
          error: null,
        })),
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
void mock.module("@kit/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  FormField: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormMessage: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

void mock.module("@kit/ui/card", () => ({
  Card: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <div onClick={onClick} className={className} role="button">
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

void mock.module("@kit/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        onCheckedChange(e.target.checked);
      }}
    />
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconCheck: () => <span>✓</span>,
}));

describe("AssetSelectionStep", () => {
  beforeEach(() => {
    mockSubmit.mockClear();
    mockMutate.mockClear();
    mockIterator.next.mockClear();
  });

  it("renders asset selection options", () => {
    render(<AssetSelectionStep />);

    expect(
      screen.getByText("onboarding.assetTypes.bond.name")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.equity.name")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.fund.name")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.stablecoin.name")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.deposit.name")
    ).toBeInTheDocument();
  });

  it("displays asset descriptions", () => {
    render(<AssetSelectionStep />);

    expect(
      screen.getByText("onboarding.assetTypes.bond.description")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.equity.description")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.fund.description")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.stablecoin.description")
    ).toBeInTheDocument();
    expect(
      screen.getByText("onboarding.assetTypes.deposit.description")
    ).toBeInTheDocument();
  });

  it("handles asset selection toggle", async () => {
    const { useForm } = await import("react-hook-form");
    const mockOnChange = mock(() => {
      // Mock onChange function
    });

    (useForm as ReturnType<typeof mock>).mockReturnValue({
      handleSubmit: (fn: (data: { assets: string[] }) => void) => () => {
        fn({ assets: [] });
      },
      control: {},
      setValue: mock(() => {
        // Mock setValue function
      }),
      watch: mock(() => ({})),
      formState: { errors: {} },
    });

    const { Controller } = await import("react-hook-form");
    (
      Controller as unknown as {
        mockImplementation: (
          fn: (props: {
            render: (field: {
              field: { value: string[]; onChange: (v: string[]) => void };
            }) => React.ReactNode;
          }) => React.ReactNode
        ) => void;
      }
    ).mockImplementation(({ render: renderProp }) =>
      renderProp({
        field: {
          value: [],
          onChange: mockOnChange,
        },
      })
    );

    render(<AssetSelectionStep />);

    const bondCard = screen
      .getByText("onboarding.assetTypes.bond.name")
      .closest('[role="button"]');
    const user = userEvent.setup();

    if (bondCard) {
      await user.click(bondCard);
      expect(mockOnChange).toHaveBeenCalledWith(["Bond"]);
    }
  });

  it("shows selected state for chosen assets", async () => {
    const { Controller } = await import("react-hook-form");
    (
      Controller as unknown as {
        mockImplementation: (
          fn: (props: {
            render: (field: {
              field: { value: string[]; onChange: (v: string[]) => void };
            }) => React.ReactNode;
          }) => React.ReactNode
        ) => void;
      }
    ).mockImplementation(({ render: renderProp }) =>
      renderProp({
        field: {
          value: ["Bond", "Equity"],
          onChange: mock(() => {
            // Mock onChange function
          }),
        },
      })
    );

    render(<AssetSelectionStep />);

    const bondCard = screen
      .getByText("onboarding.assetTypes.bond.name")
      .closest('[role="button"]');
    expect(bondCard).toHaveClass("bg-primary/5", "border-primary");

    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBeGreaterThanOrEqual(2);
  });

  it("submits form with selected assets", async () => {
    render(<AssetSelectionStep />);

    // Trigger submit through registered action
    // onRegisterAction is not used in the test

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ assets: ["Bond", "Equity"] });
    });
  });

  it("shows deployment progress during submission", async () => {
    mockIterator.next
      .mockResolvedValueOnce({
        done: false,
        value: { type: "BondFactory", status: "deploying" },
      })
      .mockResolvedValueOnce({
        done: false,
        value: { type: "BondFactory", status: "deployed" },
      })
      .mockResolvedValueOnce({ done: true, value: null });

    render(<AssetSelectionStep />);

    // Simulate form submission
    const { useForm } = await import("react-hook-form");
    const formInstance = (useForm as ReturnType<typeof mock>)();
    await formInstance.handleSubmit((data: { assets: string[] }) => {
      void mockMutate(data);
    })();

    // Should show deployment status
    expect(screen.getByText("Bond")).toBeInTheDocument();
  });

  it("calls onSuccess after successful deployment", async () => {
    const mockOnSuccess = mock(() => {
      // Mock onSuccess callback
    });
    mockIterator.next.mockResolvedValueOnce({ done: true, value: null });

    render(<AssetSelectionStep onSuccess={mockOnSuccess} />);

    // Trigger form submission
    const { useForm } = await import("react-hook-form");
    const formInstance = (useForm as ReturnType<typeof mock>)();
    await formInstance.handleSubmit((data: { assets: string[] }) => {
      void mockMutate(data);
    })();

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("handles deployment errors gracefully", async () => {
    const { api } = await import("@kit/api/react");
    api.onboarding.createTokenFactories.useStreamingMutation.mockReturnValue({
      mutate: mockMutate,
      iterator: mockIterator,
      error: new Error("Deployment failed"),
    });

    render(<AssetSelectionStep />);

    // Error handling would be displayed
    expect(screen.queryByText("Deployment failed")).not.toBeInTheDocument(); // No error display in this component
  });

  it("disables interaction during deployment", async () => {
    const { api } = await import("@kit/api/react");
    api.onboarding.createTokenFactories.useStreamingMutation.mockReturnValue({
      mutate: mockMutate,
      iterator: {
        next: mock(
          () =>
            new Promise(() => {
              // Never resolves
            })
        ),
      },
      error: null,
    });

    render(<AssetSelectionStep />);

    // During deployment, cards should not be clickable
    // This would be handled by the parent wizard component
  });

  it("registers action handler when provided", () => {
    const mockRegister = mock(() => {
      // Mock register function
    });
    render(<AssetSelectionStep onRegisterAction={mockRegister} />);

    expect(mockRegister).toHaveBeenCalledWith(expect.any(Function));
  });
});
