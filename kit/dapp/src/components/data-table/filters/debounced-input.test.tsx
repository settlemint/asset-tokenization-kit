/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DebouncedInput } from "./debounced-input";

describe("DebouncedInput", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers();
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("should render input with initial value", () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="initial" onChange={onChange} />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("initial");
    });

    it("should render input with number value", () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value={42} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("42");
    });

    it("should apply additional props to input", () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput
          value=""
          onChange={onChange}
          placeholder="Search..."
          className="custom-class"
          disabled
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "Search...");
      expect(input).toHaveClass("custom-class");
      expect(input).toBeDisabled();
    });
  });

  describe.skip("Debouncing Behavior", () => {
    it("should debounce onChange calls with default 500ms delay", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      // Should not call onChange immediately
      expect(onChange).not.toHaveBeenCalled();

      // Advance time by 499ms - should still not call
      vi.advanceTimersByTime(499);
      expect(onChange).not.toHaveBeenCalled();

      // Advance time by 1ms more (total 500ms) - should call now
      vi.advanceTimersByTime(1);
      expect(onChange).toHaveBeenCalledWith("test");
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("should debounce with custom delay", async () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="" onChange={onChange} debounce={1000} />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "custom");

      // Should not call onChange before custom delay
      vi.advanceTimersByTime(999);
      expect(onChange).not.toHaveBeenCalled();

      // Should call after custom delay
      vi.advanceTimersByTime(1);
      expect(onChange).toHaveBeenCalledWith("custom");
    });

    it("should reset debounce timer on each keystroke", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");

      // Type first character
      await user.type(input, "a");
      vi.advanceTimersByTime(300);

      // Type second character (should reset timer)
      await user.type(input, "b");
      vi.advanceTimersByTime(300);

      // Type third character (should reset timer again)
      await user.type(input, "c");

      // Only 300ms passed since last keystroke, should not call onChange
      expect(onChange).not.toHaveBeenCalled();

      // Complete the debounce delay
      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("abc");
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid typing correctly", async () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="" onChange={onChange} debounce={300} />
      );

      const input = screen.getByRole("textbox");

      // Simulate rapid typing
      await user.type(input, "rapid");

      // Advance time in small increments
      vi.advanceTimersByTime(100);
      expect(onChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(onChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100); // Total 300ms
      expect(onChange).toHaveBeenCalledWith("rapid");
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe.skip("Value Updates", () => {
    it("should update internal state when initial value changes", () => {
      const onChange = vi.fn();
      const { rerender } = renderWithProviders(
        <DebouncedInput value="initial" onChange={onChange} />
      );

      let input = screen.getByRole("textbox");
      expect(input).toHaveValue("initial");

      // Update the initial value prop
      rerender(<DebouncedInput value="updated" onChange={onChange} />);

      input = screen.getByRole("textbox");
      expect(input).toHaveValue("updated");
    });

    it("should handle empty string values", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);

      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("should handle number to string conversion", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value={123} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("123");

      await user.clear(input);
      await user.type(input, "456");

      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("456");
    });
  });

  describe.skip("Input Interactions", () => {
    it("should handle backspace and delete operations", async () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="delete-me" onChange={onChange} />
      );

      const input = screen.getByRole("textbox");

      // Select all and delete
      await user.click(input);
      await user.keyboard("{Control>}a{/Control}{Delete}");

      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("should handle paste operations", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");

      // Simulate paste
      await user.click(input);
      await user.paste("pasted content");

      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("pasted content");
    });

    it("should handle focus and blur events", async () => {
      const onChange = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      renderWithProviders(
        <DebouncedInput
          value=""
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );

      const input = screen.getByRole("textbox");

      await user.click(input);
      expect(onFocus).toHaveBeenCalled();

      await user.tab();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe.skip("Cleanup and Memory Management", () => {
    it("should clear timeout on unmount", () => {
      const onChange = vi.fn();
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const { unmount } = renderWithProviders(
        <DebouncedInput value="" onChange={onChange} />
      );

      // Start typing to create a timeout
      const input = screen.getByRole("textbox");
      void user.type(input, "test");

      // Unmount before timeout completes
      unmount();

      // Should have called clearTimeout
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it("should clear previous timeout when value changes", async () => {
      const onChange = vi.fn();
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");

      // Type first character
      await user.type(input, "a");
      const firstCallCount = clearTimeoutSpy.mock.calls.length;

      // Type second character (should clear previous timeout)
      await user.type(input, "b");
      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(firstCallCount);

      clearTimeoutSpy.mockRestore();
    });
  });

  describe.skip("Edge Cases", () => {
    it("should handle zero debounce delay", async () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="" onChange={onChange} debounce={0} />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "immediate");

      // With 0 debounce, should call immediately on next tick
      vi.advanceTimersByTime(0);
      expect(onChange).toHaveBeenCalledWith("immediate");
    });

    it("should handle very large debounce delays", async () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="" onChange={onChange} debounce={10_000} />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "slow");

      vi.advanceTimersByTime(9999);
      expect(onChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onChange).toHaveBeenCalledWith("slow");
    });

    it("should handle special characters and unicode", async () => {
      const onChange = vi.fn();
      renderWithProviders(<DebouncedInput value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello 🌍 éñ");

      vi.advanceTimersByTime(500);
      expect(onChange).toHaveBeenCalledWith("Hello 🌍 éñ");
    });

    it("should handle disabled state", () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="disabled" onChange={onChange} disabled />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
      expect(input).toHaveValue("disabled");
    });

    it("should handle readonly state", () => {
      const onChange = vi.fn();
      renderWithProviders(
        <DebouncedInput value="readonly" onChange={onChange} readOnly />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveValue("readonly");
    });
  });

  describe.skip("Performance", () => {
    it("should not create unnecessary timeouts", () => {
      const onChange = vi.fn();
      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

      renderWithProviders(
        <DebouncedInput value="stable" onChange={onChange} />
      );

      // Should have created one initial timeout
      const initialCalls = setTimeoutSpy.mock.calls.length;

      // Re-render with same props shouldn't create new timeout
      const { rerender } = renderWithProviders(
        <DebouncedInput value="stable" onChange={onChange} />
      );

      rerender(<DebouncedInput value="stable" onChange={onChange} />);

      // Should not have created additional timeouts
      expect(setTimeoutSpy.mock.calls.length).toBe(initialCalls);

      setTimeoutSpy.mockRestore();
    });
  });
});
