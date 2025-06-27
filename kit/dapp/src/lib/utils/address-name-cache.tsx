import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Address } from "viem";
import { getAddress } from "viem";

// Type for the filter value object used by DataTable
interface FilterValue {
  operator: string;
  values: string[];
}

interface AddressNameCache {
  // Get a name for an address from the cache
  getNameForAddress: (address: string) => string | undefined;
  // Set a name for an address in the cache
  setNameForAddress: (address: string, name: string) => void;
  // Check if the address or its name matches a search term
  addressOrNameMatches: (address: string, searchTerm: string) => boolean;
}

// Create a global cache that can be accessed outside of React components
// This is a workaround for filter functions that can't use hooks
const globalAddressNameCache: Record<string, string> = {};

const AddressNameCacheContext = createContext<AddressNameCache | null>(null);

/**
 * Provider component for the address name cache
 */
export function AddressNameCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Store the name mapping
  const [addressNameMap, setAddressNameMap] = useState<Record<string, string>>(
    {}
  );

  // Get a name for an address
  const getNameForAddress = useCallback(
    (address: string): string | undefined => {
      try {
        const normalizedAddress = getAddress(address as Address);
        return addressNameMap[normalizedAddress];
      } catch {
        return undefined;
      }
    },
    [addressNameMap]
  );

  // Set a name for an address
  const setNameForAddress = useCallback((address: string, name: string) => {
    if (!address || !name) {
      return;
    }

    try {
      const normalizedAddress = getAddress(address as Address);
      // Update both the React state and the global cache
      setAddressNameMap((prev) => ({
        ...prev,
        [normalizedAddress]: name,
      }));

      // Also update the global cache for filter functions
      globalAddressNameCache[normalizedAddress] = name;
    } catch {
      console.warn("Invalid address in setNameForAddress:", address);
    }
  }, []);

  // Check if the address or its name matches a search term
  const addressOrNameMatches = useCallback(
    (address: string, searchTerm: string): boolean => {
      if (!address || !searchTerm) {
        return false;
      }

      try {
        const normalizedAddress = getAddress(address as Address);

        // Check if the address contains the search term
        if (
          normalizedAddress.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return true;
        }

        // Check if the name contains the search term
        const name = addressNameMap[normalizedAddress];
        if (name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [addressNameMap]
  );

  // Create memoized value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      getNameForAddress,
      setNameForAddress,
      addressOrNameMatches,
    }),
    [getNameForAddress, setNameForAddress, addressOrNameMatches]
  );

  return (
    <AddressNameCacheContext.Provider value={value}>
      {children}
    </AddressNameCacheContext.Provider>
  );
}

/**
 * Hook to access the address name cache
 */
export function useAddressNameCache(): AddressNameCache {
  const context = useContext(AddressNameCacheContext);
  if (!context) {
    throw new Error(
      "useAddressNameCache must be used within an AddressNameCacheProvider"
    );
  }
  return context;
}

/**
 * Helper function to check if an address or its name matches a search term
 */
function matchesSearch(address: Address, searchTerm: string): boolean {
  try {
    const normalizedAddress = getAddress(address);
    const searchTermLower = searchTerm.toLowerCase();

    // Check if the address contains the search term
    if (normalizedAddress.toLowerCase().includes(searchTermLower)) {
      return true;
    }

    // Check if the name contains the search term
    const name = globalAddressNameCache[normalizedAddress];
    if (name?.toLowerCase().includes(searchTermLower)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Filter function for DataTable that checks both address and name
 * This doesn't use hooks directly, instead accessing the global cache
 */
export function addressNameFilter(
  row: unknown,
  columnId: string,
  filterValue: FilterValue
): boolean {
  // Skip empty filters
  if (!filterValue?.values || filterValue.values.length === 0) {
    return true;
  }

  try {
    const address =
      typeof row === "object" &&
      row &&
      "getValue" in row &&
      typeof row.getValue === "function"
        ? row.getValue(columnId)
        : undefined;
    if (!address) return false;

    // Handle different filter operators
    const operator = filterValue.operator || "contains";

    switch (operator) {
      case "contains":
        // Check if any of the filter values match the address or name
        return filterValue.values.some((value) =>
          matchesSearch(address as Address, value)
        );

      case "equals":
        // Check for exact match
        return filterValue.values.some((value) => {
          try {
            const normalizedAddress = getAddress(address as Address);
            const normalizedValue = getAddress(value as Address);
            return normalizedAddress === normalizedValue;
          } catch {
            // If value isn't a valid address, check name for exact match
            const name = globalAddressNameCache[getAddress(address as Address)];
            return name === value;
          }
        });

      case "startsWith":
        return filterValue.values.some((value) => {
          const normalizedAddress = getAddress(address as Address);
          const searchTermLower = value.toLowerCase();

          if (normalizedAddress.toLowerCase().startsWith(searchTermLower)) {
            return true;
          }

          const name = globalAddressNameCache[normalizedAddress];
          return name?.toLowerCase().startsWith(searchTermLower);
        });

      default:
        // For unknown operators, fallback to contains
        return filterValue.values.some((value) =>
          matchesSearch(address as Address, value)
        );
    }
  } catch {
    return false;
  }
}
