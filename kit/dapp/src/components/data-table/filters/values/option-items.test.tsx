/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MultiOptionItem } from "./multi-option-item";
import { OptionItem } from "./option-item";

// Mock the UI components
vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: vi.fn(({ checked, className }) => (
    <input
      type="checkbox"
      checked={checked}
      className={className}
      data-testid="checkbox"
      readOnly
    />
  )),
}));

vi.mock("@/components/ui/command", () => ({
  CommandItem: vi.fn(({ children, onSelect, className }) => (
    <div
      onClick={onSelect}
      className={className}
      data-testid="command-item"
      role="option"
    >
      {children}
    </div>
  )),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Circle: vi.fn(({ className }) => (
    <span className={className} data-testid="circle-icon">
      ○
    </span>
  )),
  CircleCheck: vi.fn(({ className }) => (
    <span className={className} data-testid="circle-check-icon">
      ✓
    </span>
  )),
}));

describe("MultiOptionItem", () => {
  const defaultProps = {
    option: {
      label: "Active",
      value: "active",
    },
    checked: false,
    count: 5,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render option label and count", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render checkbox with correct checked state", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} checked={true} />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should render unchecked checkbox", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} checked={false} />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should handle selection callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithProviders(
      <MultiOptionItem {...defaultProps} onSelect={onSelect} checked={false} />
    );

    const item = screen.getByTestId("command-item");
    await user.click(item);

    expect(onSelect).toHaveBeenCalledWith("active", true);
  });

  it("should handle deselection callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithProviders(
      <MultiOptionItem {...defaultProps} onSelect={onSelect} checked={true} />
    );

    const item = screen.getByTestId("command-item");
    await user.click(item);

    expect(onSelect).toHaveBeenCalledWith("active", false);
  });

  it("should render option with React element icon", () => {
    const IconComponent = () => <span data-testid="custom-icon">★</span>;
    const option = {
      label: "Starred",
      value: "starred",
      icon: <IconComponent />,
    };

    renderWithProviders(<MultiOptionItem {...defaultProps} option={option} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("should render option with component function icon", () => {
    const IconComponent = vi.fn(({ className }) => (
      <span className={className} data-testid="component-icon">
        🎯
      </span>
    ));

    const option = {
      label: "Target",
      value: "target",
      icon: IconComponent,
    };

    renderWithProviders(<MultiOptionItem {...defaultProps} option={option} />);

    expect(screen.getByTestId("component-icon")).toBeInTheDocument();
    expect(IconComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        className: "size-4 text-primary",
      }),
      undefined
    );
  });

  it("should render without icon when not provided", () => {
    const option = {
      label: "No Icon",
      value: "no-icon",
    };

    renderWithProviders(<MultiOptionItem {...defaultProps} option={option} />);

    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("component-icon")).not.toBeInTheDocument();
  });

  it("should display count with special formatting for large numbers", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} count={150} />);

    expect(screen.getByText("100+")).toBeInTheDocument();
    expect(screen.queryByText("150")).not.toBeInTheDocument();
  });

  it("should apply slashed-zero class for zero count", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} count={0} />);

    const countElement = screen.getByText("0");
    expect(countElement).toHaveClass("slashed-zero");
  });

  it("should not apply slashed-zero class for non-zero count", () => {
    renderWithProviders(<MultiOptionItem {...defaultProps} count={5} />);

    const countElement = screen.getByText("5");
    expect(countElement).not.toHaveClass("slashed-zero");
  });
});

describe("OptionItem", () => {
  const defaultProps = {
    option: {
      label: "Active",
      value: "active",
    },
    checked: false,
    count: 5,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render option label and count", () => {
    renderWithProviders(<OptionItem {...defaultProps} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render CircleCheck icon when checked", () => {
    renderWithProviders(<OptionItem {...defaultProps} checked={true} />);

    expect(screen.getByTestId("circle-check-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("circle-icon")).not.toBeInTheDocument();
  });

  it("should render Circle icon when unchecked", () => {
    renderWithProviders(<OptionItem {...defaultProps} checked={false} />);

    expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("circle-check-icon")).not.toBeInTheDocument();
  });

  it("should handle selection callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithProviders(
      <OptionItem {...defaultProps} onSelect={onSelect} checked={false} />
    );

    const item = screen.getByTestId("command-item");
    await user.click(item);

    expect(onSelect).toHaveBeenCalledWith("active", true);
  });

  it("should handle deselection callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithProviders(
      <OptionItem {...defaultProps} onSelect={onSelect} checked={true} />
    );

    const item = screen.getByTestId("command-item");
    await user.click(item);

    expect(onSelect).toHaveBeenCalledWith("active", false);
  });

  it("should render option with React element icon", () => {
    const IconComponent = () => <span data-testid="custom-icon">★</span>;
    const option = {
      label: "Starred",
      value: "starred",
      icon: <IconComponent />,
    };

    renderWithProviders(<OptionItem {...defaultProps} option={option} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("should render option with component function icon", () => {
    const IconComponent = vi.fn(({ className }) => (
      <span className={className} data-testid="component-icon">
        🎯
      </span>
    ));

    const option = {
      label: "Target",
      value: "target",
      icon: IconComponent,
    };

    renderWithProviders(<OptionItem {...defaultProps} option={option} />);

    expect(screen.getByTestId("component-icon")).toBeInTheDocument();
    expect(IconComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        className:
          "size-4 text-muted-foreground transition-colors group-hover:text-foreground",
      }),
      undefined
    );
  });

  it("should render without icon when not provided", () => {
    const option = {
      label: "No Icon",
      value: "no-icon",
    };

    renderWithProviders(<OptionItem {...defaultProps} option={option} />);

    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("component-icon")).not.toBeInTheDocument();
  });

  it("should display count with special formatting for large numbers", () => {
    renderWithProviders(<OptionItem {...defaultProps} count={150} />);

    expect(screen.getByText("100+")).toBeInTheDocument();
    expect(screen.queryByText("150")).not.toBeInTheDocument();
  });

  it("should apply slashed-zero class for zero count", () => {
    renderWithProviders(<OptionItem {...defaultProps} count={0} />);

    const countElement = screen.getByText("0");
    expect(countElement).toHaveClass("slashed-zero");
  });

  it("should not apply slashed-zero class for non-zero count", () => {
    renderWithProviders(<OptionItem {...defaultProps} count={5} />);

    const countElement = screen.getByText("5");
    expect(countElement).not.toHaveClass("slashed-zero");
  });

  it("should handle edge case counts correctly", () => {
    const { rerender } = renderWithProviders(
      <OptionItem {...defaultProps} count={99} />
    );
    expect(screen.getByText("99")).toBeInTheDocument();

    rerender(<OptionItem {...defaultProps} count={100} />);
    expect(screen.getByText("100+")).toBeInTheDocument(); // 100 counts as 100+

    rerender(<OptionItem {...defaultProps} count={101} />);
    expect(screen.getByText("100+")).toBeInTheDocument();
  });
});
