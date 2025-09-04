import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TopicListOutput } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import type { TrustedIssuerCreateInput } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create.schema";
import type { UserSearchResult } from "@/orpc/routes/user/routes/user.search.schema";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AddTrustedIssuerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet component for adding new trusted issuers
 * Allows administrators to select existing users and assign them as trusted issuers with selected topics
 */
export function AddTrustedIssuerSheet({
  open,
  onOpenChange,
}: AddTrustedIssuerSheetProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");
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
    enabled: open && searchQuery.length >= 2, // Only search when sheet is open and query is at least 2 characters
  });

  // Fetch available topics for selection
  const { data: topics } = useSuspenseQuery(
    orpc.system.claimTopics.topicList.queryOptions()
  ) as { data: TopicListOutput };

  // Create trusted issuer mutation
  const createMutation = useMutation({
    mutationFn: (data: TrustedIssuerCreateInput) =>
      client.system.trustedIssuers.create(data),
    onSuccess: () => {
      toast.success(t("trustedIssuers.toast.added"));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
      onOpenChange(false);
      form.reset();
      setSelectedUser(null);
      setSearchQuery("");
    },
    onError: (error) => {
      toast.error(
        t("trustedIssuers.toast.addError", {
          error: error.message || error.toString() || "Unknown error",
        })
      );
    },
  });

  const form = useAppForm({
    defaultValues: {
      issuerAddress: "0x" as `0x${string}`,
      claimTopicIds: [] as string[],
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      } as UserVerification,
    },
    onSubmit: async ({ value }) => {
      const trustedIssuerAccount = await client.account.read({
        wallet: value.issuerAddress,
      });
      if (!trustedIssuerAccount.identity) {
        throw new Error("Trusted issuer account not found");
      }
      createMutation.mutate({
        issuerAddress: trustedIssuerAccount.identity,
        claimTopicIds: value.claimTopicIds,
        walletVerification: value.walletVerification,
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedUser(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    void form.handleSubmit();
  };

  const handleUserSelect = (userWallet: string | null) => {
    const user = users.find((u) => u.wallet === userWallet);
    if (user && user.wallet) {
      setSelectedUser(user);
      form.setFieldValue("issuerAddress", user.wallet);
      setSearchQuery(""); // Clear search after selection
    }
  };

  // Create a lookup map for O(1) topic retrieval and options
  const { topicLookup, topicOptions } = useMemo(() => {
    const lookup = new Map(topics.map((topic) => [topic.topicId, topic.name]));
    const options = topics.map((topic) => ({
      value: topic.topicId,
      label: topic.name,
    }));
    return { topicLookup: lookup, topicOptions: options };
  }, [topics]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("trustedIssuers.add.title")}</SheetTitle>
          <SheetDescription>
            {t("trustedIssuers.add.selectUserDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 px-6">
          <form.AppForm>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user-search">
                  {t("trustedIssuers.add.fields.selectUser.label")}
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
                        form.setFieldValue(
                          "issuerAddress",
                          "0x" as `0x${string}`
                        );
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
                        id="user-search"
                        placeholder={t(
                          "trustedIssuers.add.fields.selectUser.placeholder"
                        )}
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
                  {t("trustedIssuers.add.fields.selectUser.description")}
                </p>
              </div>

              {selectedUser && (
                <>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {t("trustedIssuers.add.selectedUser.name")}
                        </span>
                        <span className="text-sm">{selectedUser.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {t("trustedIssuers.add.selectedUser.wallet")}
                        </span>
                        <span className="text-sm font-mono">
                          {selectedUser.wallet?.slice(0, 6)}...
                          {selectedUser.wallet?.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form.AppField
                    name="claimTopicIds"
                    children={(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="claimTopicIds">
                          {t("trustedIssuers.add.fields.claimTopics.label")}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <MultipleSelector
                          value={field.state.value.map((id: string) => ({
                            value: id,
                            label: topicLookup.get(id) || id,
                          }))}
                          onChange={(options) => {
                            field.handleChange(options.map((o) => o.value));
                          }}
                          defaultOptions={topicOptions}
                          placeholder={t(
                            "trustedIssuers.add.fields.claimTopics.placeholder"
                          )}
                          emptyIndicator={
                            <p className="text-center text-sm">
                              {t("trustedIssuers.add.fields.claimTopics.empty")}
                            </p>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "trustedIssuers.add.fields.claimTopics.description"
                          )}
                        </p>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </>
              )}
            </div>

            <SheetFooter className="mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                {t("trustedIssuers.add.actions.cancel")}
              </Button>
              <form.VerificationButton
                onSubmit={handleSubmit}
                walletVerification={{
                  title: t("trustedIssuers.add.verification.title"),
                  description: t("trustedIssuers.add.verification.description"),
                  setField: (verification) => {
                    form.setFieldValue("walletVerification", verification);
                  },
                }}
                disabled={!selectedUser || createMutation.isPending}
              >
                {createMutation.isPending
                  ? t("trustedIssuers.add.actions.adding")
                  : t("trustedIssuers.add.actions.add")}
              </form.VerificationButton>
            </SheetFooter>
          </form.AppForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}
