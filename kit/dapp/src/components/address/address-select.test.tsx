/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

vi.mock("@/lib/hooks/use-recent-cache", () => ({
  useRecentCache: () => ({
    recentItems: [],
    addItem: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-debounced-callback", () => ({
  useDebouncedCallback: <T extends (...args: unknown[]) => void>(fn: T) => fn,
}));

vi.mock("@/hooks/use-search-addresses", () => ({
  useSearchAddresses: vi.fn(),
}));

import { useSearchAddresses } from "@/hooks/use-search-addresses";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { AddressSelect } from "./address-select";

const mockUseSearchAddresses = vi.mocked(useSearchAddresses);

describe("AddressSelect", () => {
  beforeEach(() => {
    mockUseSearchAddresses.mockReset();
  });

  it("shows a loading state while wallet identities are resolving", async () => {
    mockUseSearchAddresses.mockReturnValue({
      searchResults: [] as EthereumAddress[],
      isLoading: true,
    });

    render(
      <AddressSelect
        value={undefined}
        onChange={vi.fn()}
        scope="user"
        placeholder="address.selectPlaceholder"
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));

    expect(screen.getByText("address.loading")).toBeInTheDocument();
  });
});
