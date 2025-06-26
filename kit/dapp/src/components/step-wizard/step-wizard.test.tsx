import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepWizard } from "./step-wizard";

// Mock dependencies
void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

void mock.module("@kit/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconArrowLeft: () => <span>←</span>,
  IconArrowRight: () => <span>→</span>,
  IconCheck: () => <span>✓</span>,
  IconX: () => <span>✕</span>,
}));

describe("StepWizard", () => {
  const defaultSteps = [
    {
      id: "step1",
      title: "Step 1",
      description: "Step 1 description",
      status: "completed" as const,
    },
    {
      id: "step2",
      title: "Step 2",
      description: "Step 2 description",
      status: "active" as const,
    },
    {
      id: "step3",
      title: "Step 3",
      description: "Step 3 description",
      status: "pending" as const,
    },
  ];

  const defaultProps = {
    steps: defaultSteps,
    currentStepId: "step2",
    title: "Wizard Title",
    description: "Wizard Description",
    onStepChange: mock(() => {
      // Mock onStepChange function
    }),
    children: <div>Step Content</div>,
  };

  beforeEach(() => {
    defaultProps.onStepChange.mockClear();
  });

  it("renders wizard structure correctly", () => {
    render(<StepWizard {...defaultProps} />);

    expect(screen.getByText("Wizard Title")).toBeInTheDocument();
    expect(screen.getByText("Wizard Description")).toBeInTheDocument();
    expect(screen.getByText("Step Content")).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<StepWizard {...defaultProps} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("shows correct step statuses", () => {
    render(<StepWizard {...defaultProps} />);

    // Complete step should have check icon
    expect(screen.getByText("✓")).toBeInTheDocument();

    // Current step should show in progress bar
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("handles step click navigation", async () => {
    render(<StepWizard {...defaultProps} />);

    const step1Button = screen.getByRole("button", { name: /Step 1/i });
    const user = userEvent.setup();

    await user.click(step1Button);

    expect(defaultProps.onStepChange).toHaveBeenCalledWith("step1");
  });

  it("renders close button when onClose is provided", () => {
    const mockClose = mock(() => {
      // Mock close function
    });
    render(<StepWizard {...defaultProps} onClose={mockClose} />);

    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("handles close button click", async () => {
    const mockClose = mock(() => {
      // Mock close function
    });
    render(<StepWizard {...defaultProps} onClose={mockClose} />);

    const closeButton = screen.getByLabelText("wizard.close");
    const user = userEvent.setup();

    await user.click(closeButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it("renders navigation buttons when enabled", () => {
    render(
      <StepWizard
        {...defaultProps}
        showBackButton
        showNextButton
        onBack={mock(() => {
          // Mock back function
        })}
        onNext={mock(() => {
          // Mock next function
        })}
      />
    );

    expect(screen.getByText("wizard.back")).toBeInTheDocument();
    expect(screen.getByText("wizard.next")).toBeInTheDocument();
  });

  it("uses custom button labels", () => {
    render(
      <StepWizard
        {...defaultProps}
        showBackButton
        showNextButton
        backLabel="Previous"
        nextLabel="Continue"
      />
    );

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("handles back button click", async () => {
    const mockBack = mock(() => {
      // Mock back function
    });
    render(<StepWizard {...defaultProps} showBackButton onBack={mockBack} />);

    const backButton = screen.getByText("wizard.back");
    const user = userEvent.setup();

    await user.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("handles next button click", async () => {
    const mockNext = mock(() => {
      // Mock next function
    });
    render(<StepWizard {...defaultProps} showNextButton onNext={mockNext} />);

    const nextButton = screen.getByText("wizard.next");
    const user = userEvent.setup();

    await user.click(nextButton);

    expect(mockNext).toHaveBeenCalled();
  });

  it("disables navigation buttons when specified", () => {
    render(
      <StepWizard
        {...defaultProps}
        showBackButton
        showNextButton
        isBackDisabled
        isNextDisabled
      />
    );

    const backButton = screen.getByText("wizard.back");
    const nextButton = screen.getByText("wizard.next");

    expect(backButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("shows step connectors between steps", () => {
    const { container } = render(<StepWizard {...defaultProps} />);

    // Should have connectors between steps
    const connectors = container.querySelectorAll('[aria-hidden="true"]');
    expect(connectors.length).toBeGreaterThan(0);
  });

  it("applies correct styling to current step", () => {
    const { container } = render(<StepWizard {...defaultProps} />);

    const currentStep = container.querySelector('[aria-current="step"]');
    expect(currentStep).toBeInTheDocument();
    expect(currentStep).toHaveTextContent("Step 2");
  });

  it("handles empty steps array", () => {
    render(<StepWizard {...defaultProps} steps={[]} />);

    expect(screen.getByText("Wizard Title")).toBeInTheDocument();
    expect(screen.getByText("Step Content")).toBeInTheDocument();
  });

  it("applies responsive design classes", () => {
    const { container } = render(<StepWizard {...defaultProps} />);

    const stepList = container.querySelector('[aria-label="Progress"]');
    expect(stepList).toHaveClass("lg:flex");
  });

  it("truncates long step names on mobile", () => {
    const longSteps = [
      {
        id: "step1",
        title: "This is a very long step name that should be truncated",
        description: "Long description",
        status: "active" as const,
      },
    ];

    render(
      <StepWizard {...defaultProps} steps={longSteps} currentStepId="step1" />
    );

    const stepName = screen.getByText(
      "This is a very long step name that should be truncated"
    );
    expect(stepName.parentElement).toHaveClass("truncate");
  });

  it("renders icons in navigation buttons", () => {
    render(<StepWizard {...defaultProps} showBackButton showNextButton />);

    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("maintains step order", () => {
    const { container } = render(<StepWizard {...defaultProps} />);

    const steps = container.querySelectorAll('[role="listitem"]');
    expect(steps[0]).toHaveTextContent("Step 1");
    expect(steps[1]).toHaveTextContent("Step 2");
    expect(steps[2]).toHaveTextContent("Step 3");
  });

  it("applies complete status styling", () => {
    render(<StepWizard {...defaultProps} />);

    // First step is completed, should have check icon
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
