import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/use-app-form";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { UserSearchResult } from "@/orpc/routes/user/routes/user.search.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Available roles that can be granted
const AVAILABLE_ROLES: Array<{
  value: AccessControlRoles;
  label: string;
  description: string;
}> = [
  {
    value: "claimPolicyManager",
    label: "Claim Policy Manager",
    description: "Can manage claim topics and trusted issuers",
  },
  {
    value: "systemModule",
    label: "System Module",
    description: "System-level access for module operations",
  },
  {
    value: "identityManager",
    label: "Identity Manager",
    description: "Can manage identity contracts and verification",
  },
  {
    value: "complianceManager",
    label: "Compliance Manager",
    description: "Can manage compliance modules and rules",
  },
  {
    value: "tokenManager",
    label: "Token Manager",
    description: "Can manage token operations",
  },
  {
    value: "addonManager",
    label: "Addon Manager",
    description: "Can manage addon modules",
  },
];

/**
 * Form component for granting roles to users
 * Allows administrators to assign blockchain roles to users
 */
export function GrantRoleForm() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<AccessControlRoles | "">("");
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

  // Grant role mutation
  const grantRoleMutation = useMutation({
    mutationFn: (data: {
      address: string;
      role: AccessControlRoles;
      walletVerification: UserVerification;
    }) =>
      client.system.accessManager.grantRole({
        address: data.address,
        role: data.role,
        walletVerification: data.walletVerification,
      }),
    onSuccess: () => {
      toast.success("Role granted successfully");
      void queryClient.invalidateQueries();
      form.reset();
      setSelectedUser(null);
      setSelectedRole("");
    },
    onError: (error) => {
      toast.error(`Failed to grant role: ${error.message}`);
    },
  });

  const form = useAppForm({
    defaultValues: {
      address: "" as `0x${string}`,
      role: "" as AccessControlRoles | "",
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      } as UserVerification,
    },
    onSubmit: ({ value }) => {
      if (value.role) {
        grantRoleMutation.mutate({
          address: value.address,
          role: value.role,
          walletVerification: value.walletVerification,
        });
      }
    },
  });

  const handleUserSelect = (userWallet: string | null) => {
    const user = users.find((u) => u.wallet === userWallet);
    if (user && user.wallet) {
      setSelectedUser(user);
      form.setFieldValue("address", user.wallet);
      setSearchQuery(""); // Clear search after selection
    }
  };

  const handleRoleSelect = (role: string) => {
    const typedRole = role as AccessControlRoles;
    setSelectedRole(typedRole);
    form.setFieldValue("role", typedRole);
  };

  const handleSubmit = () => {
    void form.handleSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Grant Role</CardTitle>
        </div>
        <CardDescription>
          Grant blockchain roles to users to give them specific permissions in
          the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Quick Action:</strong> As an admin, you can grant yourself
            the <strong>Claim Policy Manager</strong> role to manage trusted
            issuers and claim topics.
          </AlertDescription>
        </Alert>

        <form.AppForm>
          <div className="space-y-6">
            {/* User Search and Selection */}
            <div className="space-y-2">
              <Label htmlFor="user-search">
                Search User
                <span className="text-destructive ml-1">*</span>
              </Label>
              {selectedUser === null ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-search"
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
              ) : (
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
                      form.setFieldValue("address", "" as `0x${string}`);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Change User
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Search for the user who should receive the new role (minimum 2
                characters)
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role-select">
                Select Role
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select value={selectedRole} onValueChange={handleRoleSelect}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Choose a role to grant" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The blockchain role to grant to the selected user
              </p>
            </div>

            {/* Selected User Details */}
            {selectedUser && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name</span>
                    <span className="text-sm">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Wallet</span>
                    <span className="text-sm font-mono">
                      {selectedUser.wallet?.slice(0, 6)}...
                      {selectedUser.wallet?.slice(-4)}
                    </span>
                  </div>
                  {selectedRole && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Role to Grant</span>
                      <span className="text-sm font-medium text-primary">
                        {
                          AVAILABLE_ROLES.find((r) => r.value === selectedRole)
                            ?.label
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <form.VerificationButton
                onSubmit={handleSubmit}
                walletVerification={{
                  title: "Grant Role Verification",
                  description:
                    "Verify your identity to grant this role on the blockchain",
                  setField: (verification) => {
                    form.setFieldValue("walletVerification", verification);
                  },
                }}
                disabled={
                  !selectedUser || !selectedRole || grantRoleMutation.isPending
                }
              >
                {grantRoleMutation.isPending
                  ? "Granting Role..."
                  : "Grant Role"}
              </form.VerificationButton>
            </div>
          </div>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
