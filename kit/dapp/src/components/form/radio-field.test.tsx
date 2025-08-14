import { withForm } from "@/hooks/use-app-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const TestForm = withForm({
  props: {},
  render: ({ form }) => (
    <form.AppForm>
      <form.AppField
        name="choice"
        children={(field) => (
          <field.RadioField
            variant="card"
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ]}
          />
        )}
      />
    </form.AppForm>
  ),
});

describe("RadioField (card variant)", () => {
  it("updates checked state when clicking different cards", async () => {
    render(<TestForm />);
    const user = userEvent.setup();

    const optionA = screen.getByRole("radio", { name: /option a/i });
    const optionB = screen.getByRole("radio", { name: /option b/i });

    // Initial: nothing selected
    expect(optionA).toHaveAttribute("aria-checked", "false");
    expect(optionB).toHaveAttribute("aria-checked", "false");

    // Select B
    await user.click(screen.getByText(/option b/i));
    expect(optionB).toHaveAttribute("aria-checked", "true");
    expect(optionA).toHaveAttribute("aria-checked", "false");

    // Toggle to A
    await user.click(screen.getByText(/option a/i));
    expect(optionA).toHaveAttribute("aria-checked", "true");
    expect(optionB).toHaveAttribute("aria-checked", "false");
  });
});
