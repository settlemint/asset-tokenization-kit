import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserSearchResult } from "@/orpc/routes/user/routes/user.search.schema";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, Shield, User as UserIcon } from "lucide-react";
import { useMemo, useState } from "react";

// Role descriptions for display
const ROLE_DESCRIPTIONS: Record<
  string,
  {
    label: string;
    description: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  admin: {
    label: "Admin",
    description: "Full system access",
    variant: "destructive",
  },
  claimPolicyManager: {
    label: "Claim Policy Manager",
    description: "Can manage claim topics and trusted issuers",
    variant: "default",
  },
  systemModule: {
    label: "System Module",
    description: "System-level access for module operations",
    variant: "default",
  },
  identityManager: {
    label: "Identity Manager",
    description: "Can manage identity contracts and verification",
    variant: "secondary",
  },
  complianceManager: {
    label: "Compliance Manager",
    description: "Can manage compliance modules and rules",
    variant: "secondary",
  },
  tokenManager: {
    label: "Token Manager",
    description: "Can manage token operations",
    variant: "outline",
  },
  addonManager: {
    label: "Addon Manager",
    description: "Can manage addon modules",
    variant: "outline",
  },
  systemManager: {
    label: "System Manager",
    description: "Can manage system-wide settings",
    variant: "default",
  },
};

/**
 * Component for viewing blockchain roles assigned to users
 * Displays current role assignments from the AccessControl contract
 */
export function ViewUserRoles() {
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Search users with debounced query
  const { data: users = [] } = useQuery({
    queryKey: orpc.user.search.queryKey({
      input: {
        query: searchQuery,
        limit: 20,
      },
    }),
    queryFn: () =>
      client.user.search({
        query: searchQuery,
        limit: 20,
      }),
    enabled: searchQuery.length >= 2, // Only search when query is at least 2 characters
  });

  // Get system roles data
  const { data: rolesData = [] } = useQuery({
    queryKey: orpc.system.accessManager.rolesList.queryKey({
      input: {
        excludeContracts: false,
      },
    }),
    queryFn: () =>
      client.system.accessManager.rolesList({
        excludeContracts: false,
      }),
  });

  // Calculate user's blockchain roles
  const userRoles = useMemo(() => {
    if (!selectedUser?.wallet) {
      return [];
    }

    const userRoleData = rolesData.find(
      (roleEntry) =>
        roleEntry.account.toLowerCase() === selectedUser.wallet?.toLowerCase()
    );

    return userRoleData?.roles || [];
  }, [selectedUser, rolesData]);

  const handleUserSelect = (userWallet: string | null) => {
    const user = users.find((u) => u.wallet === userWallet);
    if (user) {
      setSelectedUser(user);
      setSearchQuery(""); // Clear search after selection
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle>View User Roles</CardTitle>
        </div>
        <CardDescription>
          View the blockchain roles currently assigned to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* User Search and Selection */}
          <div className="space-y-2">
            <Label htmlFor="view-user-search">
              Search User
              <span className="text-destructive ml-1">*</span>
            </Label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex flex-col">
                  <span className="font-medium">{selectedUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedUser.wallet
                      ? `${selectedUser.wallet.slice(0, 6)}...${selectedUser.wallet.slice(-4)}`
                      : "No wallet"}{" "}
                    • {selectedUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery("");
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Change User
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="view-user-search"
                    placeholder="Search by name, email, or wallet address..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
                {searchQuery.length >= 2 && users.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.wallet || user.name}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          handleUserSelect(user.wallet);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.wallet
                              ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
                              : "No wallet"}{" "}
                            • {user.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && users.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">
                    No users found matching "{searchQuery}"
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Search for a user to view their blockchain role assignments
              (minimum 2 characters)
            </p>
          </div>

          {/* Selected User Details & Roles */}
          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">User Information</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name</span>
                    <span className="text-sm">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database Role</span>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Wallet</span>
                    <span className="text-sm font-mono">
                      {selectedUser.wallet?.slice(0, 6)}...
                      {selectedUser.wallet?.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain Roles */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Blockchain Roles</span>
                </div>

                {userRoles.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This user has been granted the following blockchain roles:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userRoles.map((role: AccessControlRoles) => {
                        const roleInfo = ROLE_DESCRIPTIONS[role] || {
                          label: role,
                          description: "Custom role",
                          variant: "outline" as const,
                        };
                        return (
                          <div key={role} className="space-y-1">
                            <Badge variant={roleInfo.variant}>
                              {roleInfo.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {roleInfo.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No blockchain roles assigned
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This user only has database-level permissions
                    </p>
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Database Role:</strong> Controls access to the web
                  application and API endpoints
                </p>
                <p>
                  <strong>Blockchain Roles:</strong> Controls permission to
                  execute smart contract functions
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
