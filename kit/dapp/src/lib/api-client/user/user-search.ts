import type { User } from "@/lib/queries/user/user-schema";

/**
 * Search for users by name, wallet address, or email
 * @param searchTerm - The search term to search for
 * @returns An array of users
 */
export async function searchUser(searchTerm: string) {
  const response = await fetch(
    `/api/user/search?term=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return (await response.json()) as User[];
}
