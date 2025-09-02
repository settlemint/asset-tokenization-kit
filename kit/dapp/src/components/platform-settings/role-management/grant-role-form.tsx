import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<AccessControlRoles | "">("");

  // Fetch available users
  const { data: users = [] } = useQuery({
    queryKey: orpc.user.search.queryKey({
      input: {
        query: "",
        limit: 1000,
      },
    }),
    queryFn: () =>
      client.user.search({
        query: "", // Empty query to get all users
        limit: 1000,
      }),
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

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      form.setFieldValue("address", user.wallet as `0x${string}`);
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
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user-select">
                Select User
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select value={selectedUser?.id} onValueChange={handleUserSelect}>
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder="Choose a user to grant role" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name}
                          {user.id === users[0]?.id && " (You)"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} • {user.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the user who should receive the new role
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
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm">{selectedUser.email}</span>
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
